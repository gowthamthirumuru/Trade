import sys
from pathlib import Path
sys.path.insert(0, str(Path("A:/Trade")))

from src.ui.server.services.live_data_engine import LiveDataEngine

engine = LiveDataEngine()
print("1. Summary:")
summary = engine.get_real_data_lake_summary()
print(f"  Total candles: {summary['total_candles']:,}")
print(f"  Total lake candles: {summary['total_lake_candles']:,}")
print(f"  Total storage: {summary['total_storage_mb']} MB")
print(f"  Total partitions: {summary['total_partitions']}")
print(f"  Scanned instruments: {len(summary['instruments'])}")
for inst in summary['instruments'][:4]:
    print(f"    {inst['pair']} ({inst['type']}): {inst['candles']:,} bars, {inst['start']} to {inst['end']}, {inst['size_mb']} MB")

print("\n2. Real Candles for BTCUSDT (15m, 10):")
candles = engine.get_real_candles("BTCUSDT", "15m", 10)
print(f"  Received {len(candles)} candles:")
for c in candles[:3]:
    print(f"    {c}")

print("\n3. Real Candles for EURUSD (15m, 5):")
eur_candles = engine.get_real_candles("EURUSD", "15m", 5)
print(f"  Received {len(eur_candles)} candles:")
for c in eur_candles[:3]:
    print(f"    {c}")

print("\n4. Gap audit for BTCUSDT (15m):")
audit = engine.get_real_gap_audit("BTCUSDT", "15m")
print(f"  Status: {audit['status']}, Gaps: {audit['gaps_found']}, Completeness: {audit['completeness_pct']}%")
if audit['anomalies']:
    print(f"  Sample anomaly: {audit['anomalies'][0]}")

print("\n5. Gap audit for EURUSD (15m):")
eur_audit = engine.get_real_gap_audit("EURUSD", "15m")
print(f"  Status: {eur_audit['status']}, Gaps: {eur_audit['gaps_found']}, Completeness: {eur_audit['completeness_pct']}%")
