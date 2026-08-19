import time
import duckdb

t0 = time.time()
con = duckdb.connect()
df = con.execute("""
    SELECT 
        epoch(open_time)::BIGINT as time,
        strftime(open_time, '%Y-%m-%d %H:%M:%S') as time_str,
        round(open, 2) as open,
        round(high, 2) as high,
        round(low, 2) as low,
        round(close, 2) as close,
        round(volume, 2) as volume
    FROM (
        SELECT open_time, open, high, low, close, volume
        FROM read_parquet('data/raw/binance/BTCUSDT/1m.parquet')
        ORDER BY open_time DESC
        LIMIT 500000
    ) sub
    ORDER BY open_time ASC
""").df()

records = df.to_dict("records")
print(f"Loaded {len(records)} 1-minute rows (~1 full year) in {time.time() - t0:.3f}s")
print(f"First bar: {records[0]['time_str']} | Last bar: {records[-1]['time_str']}")
