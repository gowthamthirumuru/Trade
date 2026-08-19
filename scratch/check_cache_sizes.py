from pathlib import Path
import pandas as pd

cache_dir = Path("data/cache_1m")
if cache_dir.exists():
    for f in sorted(cache_dir.glob("*.parquet")):
        df = pd.read_parquet(f)
        if len(df) < 30000:
            print(f"Low cache file {f.name}: {len(df)} rows")
