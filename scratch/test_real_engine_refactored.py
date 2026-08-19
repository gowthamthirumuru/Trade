import duckdb
from pathlib import Path
from typing import Any, Dict, List, Optional
import time

root = Path("A:/Trade")
raw_binance = root / "data" / "raw" / "binance"
raw_dukascopy = root / "data" / "raw" / "dukascopy"

con = duckdb.connect()

print("--- Testing Real Data Lake Summary Scan ---")
t0 = time.time()
instruments = []

# Scan Binance
if raw_binance.exists():
    for symbol_dir in sorted(raw_binance.iterdir()):
        if symbol_dir.is_dir():
            symbol = symbol_dir.name
            files = list(symbol_dir.glob("*.parquet"))
            if not files:
                continue
            tfs = sorted([f.stem for f in files])
            size_mb = round(sum(f.stat().st_size for f in files) / (1024 * 1024), 2)
            
            p15 = symbol_dir / "15m.parquet"
            target = p15 if p15.exists() else files[0]
            p_str = str(target).replace("\\", "/")
            res = con.execute(f"SELECT COUNT(*), MIN(open_time), MAX(open_time) FROM read_parquet('{p_str}')").fetchone()
            
            instruments.append({
                "pair": symbol,
                "type": "Crypto",
                "timeframe": ", ".join(tfs),
                "candles": int(res[0]),
                "start": str(res[1])[:19],
                "end": str(res[2])[:19],
                "size_mb": size_mb,
                "quality": 100.0,
                "gaps": 0,
                "status": "HEALTHY"
            })

# Scan Dukascopy
if raw_dukascopy.exists():
    for symbol_dir in sorted(raw_dukascopy.iterdir()):
        if symbol_dir.is_dir():
            symbol = symbol_dir.name
            files = list(symbol_dir.glob("*.parquet"))
            if not files:
                continue
            tfs = sorted([f.stem for f in files])
            size_mb = round(sum(f.stat().st_size for f in files) / (1024 * 1024), 2)
            
            p15 = symbol_dir / "15m.parquet"
            target = p15 if p15.exists() else files[0]
            p_str = str(target).replace("\\", "/")
            res = con.execute(f"SELECT COUNT(*), MIN(open_time), MAX(open_time) FROM read_parquet('{p_str}')").fetchone()
            
            instruments.append({
                "pair": symbol,
                "type": "Forex",
                "timeframe": ", ".join(tfs),
                "candles": int(res[0]),
                "start": str(res[1])[:19],
                "end": str(res[2])[:19],
                "size_mb": size_mb,
                "quality": 100.0,
                "gaps": 0,
                "status": "HEALTHY"
            })

t_summary = time.time() - t0
print(f"Summary scan completed in {t_summary:.3f}s. Scanned {len(instruments)} instruments.")
total_c = sum(i["candles"] for i in instruments)
total_mb = round(sum(i["size_mb"] for i in instruments), 1)
print(f"Total candles: {total_c:,}, Total storage: {total_mb:,} MB")

print("\n--- Testing Real Candles for BTCUSDT (15m, 100 bars) ---")
p_btc = root / "data" / "raw" / "binance" / "BTCUSDT" / "15m.parquet"
query = f"""
    SELECT open_time, open, high, low, close, volume 
    FROM read_parquet('{str(p_btc).replace(chr(92), "/")}')
    ORDER BY open_time DESC 
    LIMIT 100
"""
df = con.execute(query).df()
print(f"BTCUSDT 15m candles: {len(df)} rows")
print(df.head(3))

print("\n--- Testing Real Gap Audit for BTCUSDT ---")
gap_query = f"""
    WITH ranked AS (
        SELECT 
            open_time,
            LAG(open_time) OVER (ORDER BY open_time) as prev_time
        FROM read_parquet('{str(p_btc).replace(chr(92), "/")}')
    )
    SELECT 
        open_time,
        prev_time,
        epoch(open_time) - epoch(prev_time) as diff_sec
    FROM ranked
    WHERE epoch(open_time) - epoch(prev_time) > 900
    ORDER BY diff_sec DESC
    LIMIT 5
"""
gaps_df = con.execute(gap_query).df()
print("Gaps found:")
print(gaps_df)
