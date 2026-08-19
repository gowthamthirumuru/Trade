import duckdb

con = duckdb.connect("db/apex.duckdb", read_only=True)
sample = con.execute("""
    SELECT trade_id, strategy, pair, timeframe, direction, entry_time, exit_time, entry_price, exit_price, pnl_r, pnl_quote, exit_reason
    FROM trades
    WHERE pair = 'BTCUSDT'
    ORDER BY entry_time DESC
    LIMIT 5
""").fetchall()

print("Sample BTCUSDT Trades:")
for s in sample:
    print(s)

strats = con.execute("SELECT strategy, count(*), round(avg(pnl_r), 2) as exp FROM trades WHERE pair = 'BTCUSDT' GROUP BY strategy").fetchall()
print("\nBTCUSDT Strategies:")
for st, cnt, exp in strats:
    print(f"  {st}: {cnt} trades, Expectancy: {exp}R")
