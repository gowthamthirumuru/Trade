from pathlib import Path
import sys
sys.path.insert(0, str(Path("A:/Trade")))

from src.ui.server.services.live_data_engine import LiveDataEngine

engine = LiveDataEngine()
print("Calling get_real_data_lake_summary()...")
summary = engine.get_real_data_lake_summary()
print(f"Total candles: {summary.get('total_candles')}")
print(f"Total storage: {summary.get('total_storage_mb')} MB")
print(f"Instruments count: {len(summary.get('instruments', []))}")
for inst in summary.get('instruments', [])[:5]:
    print(f"  {inst}")

print("\nCalling get_real_candles('BTCUSDT', '15m', 100)...")
candles = engine.get_real_candles("BTCUSDT", "15m", 100)
print(f"Returned {len(candles)} candles.")
if candles:
    print(f"First candle: {candles[0]}")
    print(f"Last candle: {candles[-1]}")
