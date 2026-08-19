import duckdb
import glob
import os

con = duckdb.connect()
files = sorted([p.replace("\\", "/") for p in glob.glob("data/raw/*/*/*.parquet")])

print(f"{'Partition Path':<40} {'Bars':<12} {'Earliest Timestamp':<24} {'Latest Timestamp':<24} {'Size MB':<8}")
print("-" * 115)

total_bars = 0
for f in files:
    res = con.execute(f"SELECT MIN(open_time) as min_t, MAX(open_time) as max_t, COUNT(*) as cnt FROM read_parquet('{f}')").df()
    min_t = str(res["min_t"].iloc[0])[:19]
    max_t = str(res["max_t"].iloc[0])[:19]
    cnt = int(res["cnt"].iloc[0])
    size_mb = os.path.getsize(f) / (1024 * 1024)
    total_bars += cnt
    print(f"{f:<40} {cnt:>10,}   {min_t:<24} {max_t:<24} {size_mb:>6.2f} MB")

print("-" * 115)
print(f"Total Bars across all {len(files)} partitions: {total_bars:,}")
