import sys
sys.path.insert(0, '.')
import duckdb

con = duckdb.connect("db/apex.duckdb", read_only=True)
print("DuckDB Tables:", con.execute("SHOW TABLES").fetchall())
print("\nSchema of trades:")
print(con.execute("DESCRIBE trades").fetchall())
print("\nSample trades:")
sample = con.execute("SELECT strategy, pair, entry_time, exit_time, entry_price, exit_price, sl_price, tp_price, pnl_r, pnl_quote FROM trades LIMIT 5").fetchall()
for s in sample:
    print(s)

print("\nStrategies available in trades:")
strats = con.execute("SELECT strategy, count(*) FROM trades GROUP BY strategy").fetchall()
for st, cnt in strats:
    print(f"  {st}: {cnt} trades")
