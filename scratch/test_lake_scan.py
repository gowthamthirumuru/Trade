import duckdb
from pathlib import Path

root = Path("A:/Trade")
raw_binance = root / "data" / "raw" / "binance"
raw_dukascopy = root / "data" / "raw" / "dukascopy"

con = duckdb.connect()

instruments = []
if raw_binance.exists():
    for symbol_dir in sorted(raw_binance.iterdir()):
        if symbol_dir.is_dir():
            symbol = symbol_dir.name
            files = list(symbol_dir.glob("*.parquet"))
            tfs = [f.stem for f in files]
            size_mb = round(sum(f.stat().st_size for f in files) / (1024 * 1024), 2)
            # Find best file for bar count
            p15 = symbol_dir / "15m.parquet"
            target = p15 if p15.exists() else (files[0] if files else None)
            cnt = 0
            min_t = "N/A"
            max_t = "N/A"
            if target:
                p_str = str(target).replace("\\", "/")
                res = con.execute(f"SELECT COUNT(*), MIN(open_time), MAX(open_time) FROM read_parquet('{p_str}')").fetchone()
                cnt = res[0]
                min_t = str(res[1])[:19]
                max_t = str(res[2])[:19]
            instruments.append({
                "pair": symbol,
                "type": "Crypto",
                "timeframe": ", ".join(sorted(tfs)),
                "candles": cnt,
                "start": min_t,
                "end": max_t,
                "size_mb": size_mb,
                "quality": 100.0,
                "status": "HEALTHY"
            })

if raw_dukascopy.exists():
    for symbol_dir in sorted(raw_dukascopy.iterdir()):
        if symbol_dir.is_dir():
            symbol = symbol_dir.name
            files = list(symbol_dir.glob("*.parquet"))
            tfs = [f.stem for f in files]
            size_mb = round(sum(f.stat().st_size for f in files) / (1024 * 1024), 2)
            p15 = symbol_dir / "15m.parquet"
            target = p15 if p15.exists() else (files[0] if files else None)
            cnt = 0
            min_t = "N/A"
            max_t = "N/A"
            if target:
                p_str = str(target).replace("\\", "/")
                res = con.execute(f"SELECT COUNT(*), MIN(open_time), MAX(open_time) FROM read_parquet('{p_str}')").fetchone()
                cnt = res[0]
                min_t = str(res[1])[:19]
                max_t = str(res[2])[:19]
            instruments.append({
                "pair": symbol,
                "type": "Forex",
                "timeframe": ", ".join(sorted(tfs)),
                "candles": cnt,
                "start": min_t,
                "end": max_t,
                "size_mb": size_mb,
                "quality": 100.0,
                "status": "HEALTHY"
            })

print(f"Scanned {len(instruments)} real instruments:")
for inst in instruments:
    print(inst)
