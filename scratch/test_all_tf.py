import time
import sys
sys.path.insert(0, ".")
from fastapi.testclient import TestClient
from src.ui.server.main import app

client = TestClient(app)
for tf in ["1m", "5m", "15m", "1h", "4h", "1d"]:
    t0 = time.time()
    r = client.get(f"/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe={tf}&limit=0")
    data = r.json()
    candles = data.get("candles", [])
    print(f"Timeframe: {tf:3s} | Status: {r.status_code} | Count: {len(candles):6d} bars | Time: {time.time() - t0:.3f}s")
