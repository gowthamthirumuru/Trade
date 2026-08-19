import time
import urllib.request
import json

urls = [
    ("15m 100k Bars", "http://127.0.0.1:8000/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe=15m&limit=100000"),
    ("1m 100k Bars", "http://127.0.0.1:8000/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe=1m&limit=100000"),
    ("1m 500k Bars (~1 Year)", "http://127.0.0.1:8000/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe=1m&limit=500000"),
    ("1m Before Time (Infinite Scroll)", "http://127.0.0.1:8000/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe=1m&before_time=1738000000&limit=10000"),
    ("1m Year 2021 Full Range (524k)", "http://127.0.0.1:8000/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe=1m&from_time=1609459200&to_time=1640995199&limit=0"),
    ("1d 100% History (2,664 days)", "http://127.0.0.1:8000/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe=1d&limit=0"),
]

for name, url in urls:
    t0 = time.time()
    resp = urllib.request.urlopen(url)
    data = json.loads(resp.read().decode("utf-8"))
    candles_count = data.get("count", len(data.get("candles", [])))
    print(f"{name:35s} | Status: {resp.status} | Candles: {candles_count:6d} | Time: {time.time()-t0:.3f}s")
