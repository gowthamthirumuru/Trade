import duckdb

con = duckdb.connect()
res = con.execute("""
    SELECT 
        strftime(open_time, '%Y-%m') as m, 
        count(*) as cnt,
        min(open_time) as first_t,
        max(open_time) as last_t
    FROM read_parquet('data/raw/binance/BTCUSDT/1m.parquet')
    GROUP BY m
    ORDER BY cnt ASC
""").fetchall()

print("Months with lowest 1m bar counts:")
for m, cnt, f, l in res:
    if cnt < 40000:
        print(f"  {m}: {cnt} bars (from {f} to {l})")
