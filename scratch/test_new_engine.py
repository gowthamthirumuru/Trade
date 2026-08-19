import time
import duckdb

def get_real_candles(target_file_str: str, limit: int = 5000, timeframe: str = "1m"):
    t0 = time.time()
    con = duckdb.connect()
    
    effective_limit = limit
    if effective_limit <= 0:
        if timeframe in ("1m", "3m"):
            effective_limit = 100000
        elif timeframe == "5m":
            effective_limit = 150000
        else:
            effective_limit = 300000

    limit_sql = f"LIMIT {effective_limit}"

    query = f"""
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
            FROM read_parquet('{target_file_str}')
            ORDER BY open_time DESC
            {limit_sql}
        ) sub
        ORDER BY open_time ASC
    """
    df = con.execute(query).df()
    con.close()
    
    records = df.to_dict("records")
    print(f"Timeframe: {timeframe} | Limit: {limit} -> Loaded: {len(records)} bars in {time.time() - t0:.3f}s")
    if records:
        print(f"  First bar: {records[0]['time_str']} | Last bar: {records[-1]['time_str']}")
    return records

print("Testing 1d ALL (100% history):")
get_real_candles("data/raw/binance/BTCUSDT/1d.parquet", limit=0, timeframe="1d")

print("\nTesting 1h ALL (100% history):")
get_real_candles("data/raw/binance/BTCUSDT/1h.parquet", limit=0, timeframe="1h")

print("\nTesting 15m ALL (100% history):")
get_real_candles("data/raw/binance/BTCUSDT/15m.parquet", limit=0, timeframe="15m")

print("\nTesting 1m ALL (100k memory buffer):")
get_real_candles("data/raw/binance/BTCUSDT/1m.parquet", limit=0, timeframe="1m")

print("\nTesting 1m standard 5k bars:")
get_real_candles("data/raw/binance/BTCUSDT/1m.parquet", limit=5000, timeframe="1m")
