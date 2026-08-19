import duckdb
from pathlib import Path

root = Path("A:/Trade")
raw_binance = root / "data" / "raw" / "binance"
raw_dukascopy = root / "data" / "raw" / "dukascopy"

con = duckdb.connect()

print("--- BINANCE ---")
if raw_binance.exists():
    for p in sorted(raw_binance.iterdir()):
        if p.is_dir():
            files = list(p.glob("*.parquet"))
            file_names = [f.name for f in files]
            print(f"Symbol {p.name}: {len(files)} files -> {file_names}")
            # inspect one file
            sample = p / "15m.parquet"
            if sample.exists():
                escaped = str(sample).replace("\\", "/")
                res = con.execute(f"SELECT COUNT(*), MIN(open_time), MAX(open_time) FROM read_parquet('{escaped}')").fetchone()
                cols = con.execute(f"SELECT * FROM read_parquet('{escaped}') LIMIT 1").df().columns.tolist()
                print(f"   Sample 15m: count={res[0]}, min={res[1]}, max={res[2]}, cols={cols}")

print("\n--- DUKASCOPY ---")
if raw_dukascopy.exists():
    for p in sorted(raw_dukascopy.iterdir()):
        if p.is_dir():
            files = list(p.glob("*.parquet"))
            file_names = [f.name for f in files]
            print(f"Symbol {p.name}: {len(files)} files -> {file_names}")
            sample = p / "15m.parquet"
            if sample.exists():
                escaped = str(sample).replace("\\", "/")
                res = con.execute(f"SELECT COUNT(*), MIN(open_time), MAX(open_time) FROM read_parquet('{escaped}')").fetchone()
                cols = con.execute(f"SELECT * FROM read_parquet('{escaped}') LIMIT 1").df().columns.tolist()
                print(f"   Sample 15m: count={res[0]}, min={res[1]}, max={res[2]}, cols={cols}")
