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
    ORDER BY open_time ASC
    LIMIT 100000
""").df()

records = df.to_dict("records")
print(f"Pandas to_dict time for 100,000 rows: {time.time() - t0:.3f}s, records count: {len(records)}")

t1 = time.time()
arrow_tbl = con.execute("""
    SELECT 
        epoch(open_time)::BIGINT as time,
        strftime(open_time, '%Y-%m-%d %H:%M:%S') as time_str,
        round(open, 2) as open,
        round(high, 2) as high,
        round(low, 2) as low,
        round(close, 2) as close,
        round(volume, 2) as volume
    FROM read_parquet('data/raw/binance/BTCUSDT/1m.parquet')
    ORDER BY open_time ASC
    LIMIT 100000
""").arrow().read_all()

records2 = arrow_tbl.to_pylist()
print(f"PyArrow to_pylist time for 100,000 rows: {time.time() - t1:.3f}s, records count: {len(records2)}")
