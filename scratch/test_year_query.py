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
    FROM read_parquet('data/raw/binance/BTCUSDT/1m.parquet')
    WHERE open_time >= to_timestamp(1609459200) AND open_time <= to_timestamp(1640995199)
    ORDER BY open_time ASC
""").df()

records = df.to_dict("records")
print(f"Loaded {len(records)} 1-minute rows for year 2021 in {time.time() - t0:.3f}s")
if records:
    print(f"First bar: {records[0]['time_str']} | Last bar: {records[-1]['time_str']}")
