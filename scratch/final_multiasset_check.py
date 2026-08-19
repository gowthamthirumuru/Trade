import sys
sys.path.insert(0, '.')
import duckdb
import time
from src.datalake.validate import validate_bars
from src.ui.server.services.live_data_engine import LiveDataEngine

print("="*60)
print("PROJECT APEX — INSTITUTIONAL MULTI-ASSET VALIDATION SUITE")
print("="*60)

engine = LiveDataEngine()
con = duckdb.connect()

instruments = ["BTCUSDT", "XAUUSD", "EURUSD", "GBPUSD"]

for inst in instruments:
    t0 = time.time()
    p_15m = f"data/raw/{'binance' if inst=='BTCUSDT' else 'dukascopy'}/{inst}/15m.parquet"
    df = con.execute(f"SELECT * FROM read_parquet('{p_15m}')").df()
    query_time = (time.time() - t0) * 1000
    
    # Check invariants
    invariants_ok = (
        (df["high"] >= df["low"]).all() and
        (df["high"] >= df["open"]).all() and
        (df["high"] >= df["close"]).all() and
        (df["low"] <= df["open"]).all() and
        (df["low"] <= df["close"]).all()
    )
    
    print(f"\nAsset: {inst}")
    print(f"  Parquet File: {p_15m}")
    print(f"  15m Bars: {len(df):,}")
    print(f"  Start: {df['open_time'].min()} | End: {df['open_time'].max()}")
    print(f"  DuckDB Query Latency: {query_time:.2f}ms")
    print(f"  OHLC Mathematical Invariants: {'PASS (100% Valid)' if invariants_ok else 'FAIL'}")
    print(f"  Session Labels: {list(df['session'].unique()) if 'session' in df.columns else 'N/A'}")

con.close()

summary = engine.get_real_data_lake_summary()
print("\n" + "="*60)
print("DATA LAKE GLOBAL METRICS:")
print(f"  Total Master Partitions: {summary['total_partitions']}")
print(f"  Total Lake Footprint: {summary['total_storage_mb']} MB")
print(f"  Total Multi-Timeframe Candles: {summary['total_lake_candles']:,}")
print("="*60)
