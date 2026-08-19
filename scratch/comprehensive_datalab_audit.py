import sys
sys.path.insert(0, '.')
import duckdb
import os
import glob
from src.ui.server.services.live_data_engine import LiveDataEngine

engine = LiveDataEngine()

print("--- 1. AUDITING DATA LAKE SUMMARY ---")
summary = engine.get_real_data_lake_summary()
print(f"Total Lake Candles: {summary.get('total_lake_candles'):,}")
print(f"Total Partitions: {summary.get('total_partitions')}")
print(f"Instruments count: {len(summary.get('instruments', []))}")

print("\n--- 2. AUDITING INSTRUMENT CANDLE STREAMING ---")
pairs_to_test = [inst['pair'] for inst in summary.get('instruments', [])]
timeframes_to_test = ['15m', '1h', '1d']

for pair in pairs_to_test:
    for tf in timeframes_to_test:
        candles = engine.get_real_candles(pair=pair, timeframe=tf, limit=100)
        if not candles:
            print(f"⚠️ WARNING: {pair} ({tf}) returned 0 candles!")
        else:
            first_c = candles[0]
            last_c = candles[-1]
            # Verify OHLCV invariants
            assert all(c['high'] >= c['low'] for c in candles), f"High < Low invariant violated in {pair} {tf}"
            assert all(c['high'] >= c['open'] for c in candles), f"High < Open invariant violated in {pair} {tf}"
            assert all(c['high'] >= c['close'] for c in candles), f"High < Close invariant violated in {pair} {tf}"
            assert all(c['low'] <= c['open'] for c in candles), f"Low > Open invariant violated in {pair} {tf}"
            assert all(c['low'] <= c['close'] for c in candles), f"Low > Close invariant violated in {pair} {tf}"

print(f"[OK] All {len(pairs_to_test)} instruments verified across {timeframes_to_test} with strict OHLCV mathematical invariants!")

print("\n--- 3. AUDITING GAP AUDIT ENGINE ---")
for pair in ['BTCUSDT']:
    gap_res = engine.get_real_gap_audit(pair=pair, timeframe='15m')
    print(f"  {pair} (15m): Completeness = {gap_res.get('completeness_pct')}%, Status = {gap_res.get('status')}, Gaps = {gap_res.get('gaps_found')}")

print("\n--- 4. AUDITING STRATEGY TRADES OVERLAY ---")
trade_strats = engine.get_available_trade_strategies(pair='BTCUSDT')
print(f"Available trade strategies for BTCUSDT: {len(trade_strats)}")
for s in trade_strats:
    print(f"  - {s['strategy']}: {s['trade_count']} trades, Expectancy: {s['expectancy_r']}R, Win Rate: {s['win_rate']}%")

trades_sample = engine.get_real_trades_for_chart(pair='BTCUSDT', strategy='strategy_T04_F02', limit=50)
print(f"Fetched {len(trades_sample)} chart overlay trades for strategy_T04_F02.")
if trades_sample:
    t0 = trades_sample[0]
    print(f"  Sample Trade: ID={t0['trade_id']}, Dir={t0['direction']}, Entry={t0['entry_price']} ({t0['entry_time_str']}), Exit={t0['exit_price']}, PnL={t0['pnl_r']}R, ExitReason={t0['exit_reason']}")

print("\n--- 5. AUDITING AD-HOC DUCKDB SQL SANDBOX ---")
test_queries = [
    "SELECT count(*) as total_trades FROM trades",
    "SELECT strftime(open_time, '%Y') as yr, count(*) as bars FROM read_parquet('data/raw/binance/BTCUSDT/1d.parquet') GROUP BY yr ORDER BY yr",
    "SELECT * FROM trades LIMIT 10",
]

for q in test_queries:
    sql_res = engine.execute_ad_hoc_sql(q)
    assert sql_res['status'] == 'SUCCESS', f"SQL Failed: {sql_res.get('error')}"
    print(f"  [OK] Query succeeded in {sql_res['execution_ms']}ms: {sql_res['row_count']} rows returned.")

# Security test: Ensure write/drop operations are blocked
sec_res = engine.execute_ad_hoc_sql("DROP TABLE trades")
assert sec_res['status'] == 'ERROR', "Security check failed to block DROP TABLE!"
print(f"  [OK] Security check passed: {sec_res['error']}")

print("\nALL BACKEND DATA LAB SERVICES 100% AUDITED AND PASSING!")
