import duckdb
import os

p15 = 'data/raw/binance/BTCUSDT/15m.parquet'
p1m = 'data/raw/binance/BTCUSDT/1m.parquet'

con = duckdb.connect()
print('=== 15m file ===')
if os.path.exists(p15):
    res = con.execute(f'SELECT MIN(open_time), MAX(open_time), COUNT(*) FROM read_parquet("{p15}")').fetchall()
    print('15m overall:', res)
    months = con.execute(f"""
        SELECT strftime(open_time, '%Y-%m') as m, count(*) 
        FROM read_parquet("{p15}") 
        GROUP BY m 
        ORDER BY m
    """).fetchall()
    print('15m total months:', len(months))
    for m, c in months:
        print(f'  {m}: {c} bars')

print('\n=== 1m file ===')
if os.path.exists(p1m):
    res1m = con.execute(f'SELECT MIN(open_time), MAX(open_time), COUNT(*) FROM read_parquet("{p1m}")').fetchall()
    print('1m overall:', res1m)
    months1m = con.execute(f"""
        SELECT strftime(open_time, '%Y-%m') as m, count(*) 
        FROM read_parquet("{p1m}") 
        GROUP BY m 
        ORDER BY m
    """).fetchall()
    print('1m total months:', len(months1m))
    for m, c in months1m[:15]:
        print(f'  {m}: {c} bars')
    if len(months1m) > 15:
        print(f'  ... and {len(months1m) - 15} more months')
