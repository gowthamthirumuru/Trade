import duckdb
from pathlib import Path
import time

root = Path("A:/Trade")
con = duckdb.connect()

total_bytes = 0
parquet_files = list(root.glob("data/**/*.parquet"))
print(f"Total parquet files on disk: {len(parquet_files)}")
total_bytes = sum(f.stat().st_size for f in parquet_files)
print(f"Total storage on disk: {total_bytes / (1024*1024):.2f} MB ({total_bytes / (1024*1024*1024):.3f} GB)")

t0 = time.time()
total_bars = 0
for f in parquet_files:
    escaped = str(f).replace("\\", "/")
    cnt = con.execute(f"SELECT COUNT(*) FROM read_parquet('{escaped}')").fetchone()[0]
    total_bars += cnt

print(f"Total candles across all {len(parquet_files)} parquet files: {total_bars:,} bars (counted in {time.time() - t0:.2f}s)")
