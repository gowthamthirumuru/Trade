import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import time
from src.ui.server.services.backtest_engine import BacktestEngine

t0 = time.time()
eng = BacktestEngine()
res = eng.run_backtest(strategy_name="BB Reversion v4", pair="XAUUSD", timeframe="15m")
print(f"Elapsed: {time.time() - t0:.2f}s")
print("Status:", res.get("status"))
print("Candles:", res.get("total_candles"))
print("Trades:", res.get("metrics", {}).get("trades_count"))
print("Net Return Pct:", res.get("metrics", {}).get("net_return_pct"))
print("Expectancy R:", res.get("metrics", {}).get("expectancy_r"))
print("Engine Time:", res.get("engine_time"))
print("Equity Points sample:", len(res.get("equity_points", [])))
print("Monthly Heatmap rows:", len(res.get("monthly_heatmap", [])))
print("Day of week rows:", len(res.get("day_of_week", [])))
print("Session performance:", res.get("session_performance"))
print("R distribution count:", len(res.get("r_distribution", [])))
print("Data split:", res.get("data_split"))
print("Trade logs sample:", len(res.get("trade_logs", [])))
