import time
import sys
sys.path.insert(0, ".")
from src.ui.server.services.live_data_engine import LiveDataEngine

e = LiveDataEngine()
t = 1738367940 # latest 1m bar timestamp

for i in range(6):
    bars = e.get_real_candles("BTCUSDT", "1m", before_time=t, limit=5000)
    print(f"Step {i+1}: Fetched {len(bars)} bars | Range: {bars[0]['time_str']} -> {bars[-1]['time_str']}")
    t = bars[0]['time']
