import urllib.request
import zipfile
import io
import pandas as pd
import numpy as np
from pathlib import Path

CACHE_DIR = Path("data/cache_1m")

for month_str in ["2018-06", "2019-01", "2018-02"]:
    cached_file = CACHE_DIR / f"BTCUSDT-1m-{month_str}.parquet"
    if cached_file.exists():
        df_cached = pd.read_parquet(cached_file)
        print(f"Cached {month_str}: {len(df_cached)} rows, from {df_cached['open_time'].min()} to {df_cached['open_time'].max()}")
    
    url = f"https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1m/BTCUSDT-1m-{month_str}.zip"
    print(f"Fetching fresh {url}...")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "APEX-Quant-Institutional/2.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            with zipfile.ZipFile(io.BytesIO(data)) as zf:
                csv_names = [n for n in zf.namelist() if n.endswith(".csv")]
                with zf.open(csv_names[0]) as csv_file:
                    raw_df = pd.read_csv(csv_file, header=None, low_memory=False)
                    print(f"Raw CSV {month_str}: shape {raw_df.shape}")
                    print("First 3 rows:")
                    print(raw_df.head(3))
                    print("Last 3 rows:")
                    print(raw_df.tail(3))
    except Exception as exc:
        print(f"Error fetching {month_str}: {exc}")
