from pathlib import Path
import duckdb

root = Path("A:/Trade")
pair = "BTCUSDT"
timeframe = "15m"
limit = 100

p_binance = root / "data" / "raw" / "binance" / pair / f"{timeframe}.parquet"
print(f"p_binance: {p_binance} exists={p_binance.exists()}")

target_file = str(p_binance).replace("\\", "/")
print(f"target_file: {target_file}")

con = duckdb.connect()
query = f"""
    SELECT open_time, open, high, low, close, volume 
    FROM read_parquet('{target_file}')
    ORDER BY open_time DESC 
    LIMIT {limit}
"""
df = con.execute(query).df()
print(f"df shape: {df.shape}")
print(df.head(2))

candles = []
if not df.empty:
    df = df.iloc[::-1].reset_index(drop=True)
    for _, row in df.iterrows():
        t_val = str(row["open_time"])
        t_str = t_val[:16].replace("T", " ") if "T" in t_val else t_val[:16]
        candles.append({
            "time": t_str,
            "open": round(float(row["open"]), 2 if float(row["open"]) > 10 else 5),
            "high": round(float(row["high"]), 2 if float(row["high"]) > 10 else 5),
            "low": round(float(row["low"]), 2 if float(row["low"]) > 10 else 5),
            "close": round(float(row["close"]), 2 if float(row["close"]) > 10 else 5),
            "volume": round(float(row["volume"]), 2),
        })

print(f"candles count: {len(candles)}")
print(f"Candle 0: {candles[0]}")
print(f"Candle -1: {candles[-1]}")
