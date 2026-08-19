import sys
sys.path.insert(0, '.')
import json
import pandas as pd
from pathlib import Path
from scripts.download_complete_forex import parse_dukascopy_json

json_path = Path("scratch/test_duka_year/eurusd-m1-bid-2024-01-01-2024-12-31.json")
df = parse_dukascopy_json(json_path, "EURUSD")
print(f"Parsed {len(df)} EURUSD 1m bars for 2024!")
print(f"First bar: {df.iloc[0]['open_time']}, Close={df.iloc[0]['close']}")
print(f"Last bar: {df.iloc[-1]['open_time']}, Close={df.iloc[-1]['close']}")
print(f"Columns: {list(df.columns)}")
print(f"Session distribution:\n{df['session'].value_counts()}")
