import duckdb

for tf in ['15m', '1m', '1h', '1d']:
    con = duckdb.connect()
    p = f'data/raw/binance/BTCUSDT/{tf}.parquet'
    cnt = con.execute(f'SELECT count(*), min(open_time), max(open_time) FROM read_parquet("{p}")').fetchall()
    print(f'=== {tf} ===')
    print('Count & Range:', cnt)
    
    sec = {'1m': 60, '15m': 900, '1h': 3600, '1d': 86400}[tf]
    gaps = con.execute(f"""
        WITH ranked AS (
            SELECT open_time, LAG(open_time) OVER (ORDER BY open_time) as prev_time
            FROM read_parquet("{p}")
        )
        SELECT open_time, prev_time, epoch(open_time) - epoch(prev_time) as diff_sec
        FROM ranked
        WHERE epoch(open_time) - epoch(prev_time) > {sec * 1.5}
        ORDER BY diff_sec DESC
    """).fetchall()
    print(f'Gaps found in {tf}:', len(gaps))
    for g in gaps[:10]:
        print(f'  Gap: {g[1]} to {g[0]} ({g[2]/60:.1f} min missing)')
