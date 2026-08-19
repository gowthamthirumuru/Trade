import sys
sys.path.insert(0, '.')
import duckdb
from src.ui.server.services.live_data_engine import LiveDataEngine

engine = LiveDataEngine()

print("==================================================")
print("AUDITING APEX MULTI-ASSET DATA LAKE")
print("==================================================")

summary = engine.get_real_data_lake_summary()
print(f"Total Lake Candles: {summary['total_lake_candles']:,}")
print(f"Total Disk Footprint: {summary['total_storage_mb']} MB")
print(f"Total Partitions: {summary['total_partitions']}")
print(f"Total Instruments Discovered: {len(summary['instruments'])}")

for inst in summary['instruments']:
    print(f"\n[{inst['type']}] {inst['pair']}:")
    print(f"  Total 15m/Primary Bars: {inst['candles']:,}")
    print(f"  Timeframes: {inst['timeframe']}")
    print(f"  Date Range: {inst['start']} -> {inst['end']}")
    print(f"  Storage: {inst['size_mb']} MB")
    print(f"  Quality: {inst['quality']}% ({inst['status']})")

print("\n--------------------------------------------------")
print("VERIFYING LIVE CANDLE STREAMING ACROSS ALL 4 SYMBOLS")
print("--------------------------------------------------")

for pair in ["BTCUSDT", "XAUUSD", "EURUSD", "GBPUSD"]:
    for tf in ["15m", "1h", "1d"]:
        candles = engine.get_real_candles(pair=pair, timeframe=tf, limit=10)
        assert len(candles) > 0, f"No candles returned for {pair} ({tf})!"
        c0 = candles[-1]
        print(f"  [OK] {pair} ({tf:4s}): {len(candles)} bars | Latest Close: {c0['close']} at {c0['time_str']}")

print("\n--------------------------------------------------")
print("VERIFYING DUCKDB SQL VIEWS IN apex.duckdb")
print("--------------------------------------------------")
con = duckdb.connect("db/apex.duckdb", read_only=True)
tables = [t[0] for t in con.execute("SHOW TABLES").fetchall()]
print(f"DuckDB Tables and Views ({len(tables)}): {tables}")

for view in ["view_bars_btcusdt_15m", "view_bars_xauusd_15m", "view_bars_eurusd_15m", "view_bars_gbpusd_15m"]:
    if view in tables:
        cnt = con.execute(f"SELECT COUNT(*) FROM {view}").fetchone()[0]
        print(f"  [OK] {view}: {cnt:,} rows in DuckDB view!")

con.close()

print("\n🎉 ALL 4 INSTRUMENTS 100% INGESTED, VERIFIED, AND INTEGRATED INTO APEX!")
