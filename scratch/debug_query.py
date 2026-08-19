import sys
sys.path.insert(0, ".")
import time
from src.ui.server.services.live_data_engine import LiveDataEngine

t0 = time.time()
engine = LiveDataEngine()
candles = engine.get_real_candles("BTCUSDT", "1m", limit=0)
print(f"Time taken: {time.time() - t0:.2f}s, Candles count: {len(candles)}")
