import sys
sys.path.insert(0, '.')
from src.ui.server.services.live_data_engine import LiveDataEngine

engine = LiveDataEngine()
for tf in ['1m', '5m', '15m', '1h', '4h', '1d']:
    candles = engine.get_real_candles(pair='BTCUSDT', timeframe=tf, limit=100)
    print(f"TF {tf}: fetched {len(candles)} candles. First: {candles[0]['time_str']} ({candles[0]['time']}), Last: {candles[-1]['time_str']} ({candles[-1]['time']}), Close: {candles[-1]['close']}")

# Test Year 2018 (which had missing June previously)
candles_2018 = engine.get_real_candles(pair='BTCUSDT', timeframe='15m', from_time=1514764800, to_time=1546300799, limit=0)
print(f"Year 2018 (15m): fetched {len(candles_2018)} candles across full 2018 year!")

# Test Year 2019 (which had missing Jan previously)
candles_2019 = engine.get_real_candles(pair='BTCUSDT', timeframe='15m', from_time=1546300800, to_time=1577836799, limit=0)
print(f"Year 2019 (15m): fetched {len(candles_2019)} candles across full 2019 year!")

# Test Gap Audit for 15m
audit_15m = engine.get_real_gap_audit(pair='BTCUSDT', timeframe='15m')
print("Gap Audit (15m):", audit_15m)
