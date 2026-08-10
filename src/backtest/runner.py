"""
Backtest Engine Orchestrator & Execution Runner Module.

Coordinates data loading, feature joining, backtest execution, metric panel calculation,
and run registry persistence.

Context:
    Layer 4 (Backtest Engine) runner component specified in Master Plan §12.4 & §C2.5.
"""

import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional, Tuple
import pandas as pd

from src.backtest.metrics import PerformanceMetricsPanel
from src.backtest.registry import write_run_registry
from src.backtest.vectorbt_engine import run_vectorized_backtest
from src.datalake.api import get_bars
from src.features.api import get_features

logger = logging.getLogger(__name__)


def execute_realistic_backtest(
    strategy_config: Dict[str, Any],
    pair: str,
    start_date: str,
    end_date: str,
    timeframe: str = "1m",
    data_dir: Optional[Path] = None,
    runs_dir: Optional[Path] = None,
) -> Tuple[str, PerformanceMetricsPanel]:
    """Executes a full realistic backtest and writes artifacts to runs/<run_id>/ (§C2.5).

    Args:
        strategy_config (Dict[str, Any]): Strategy configuration dictionary.
        pair (str): Trading pair symbol.
        start_date (str): Start date string.
        end_date (str): End date string.
        timeframe (str): Timeframe symbol. Defaults to '1m'.
        data_dir (Optional[Path]): Data directory override.
        runs_dir (Optional[Path]): Runs directory override.

    Returns:
        Tuple[str, PerformanceMetricsPanel]: Run ID and calculated performance metrics panel.
    """
    # Load bars and features via official Data Lake & Feature Factory APIs
    df_bars = get_bars(pair, timeframe, start_date, end_date, data_dir=data_dir)
    df_features = get_features(pair, timeframe, start_date, end_date, data_dir=data_dir)

    if df_bars.empty:
        raise ValueError(f"No bar data returned for pair {pair} tf {timeframe} ({start_date} to {end_date})")

    t_id = strategy_config.get("trigger", "T01")
    f_id = strategy_config.get("filter", "F01")
    x_id = strategy_config.get("exit", "X01")
    params = strategy_config.get("params", {"direction": "long"})
    params["pair"] = pair
    params["timeframe"] = timeframe

    # Execute vectorized backtest
    trades_df, equity_series, panel = run_vectorized_backtest(
        df_bars, df_features, t_id, f_id, x_id, params
    )

    run_id = f"run_{strategy_config.get('name', 'strategy')}_{pair}_{timeframe}_{int(time.time())}"
    strategy_meta = {
        "name": strategy_config.get("name", "strategy"),
        "trigger": t_id,
        "filter": f_id,
        "exit": x_id,
        "params": params,
        "pair": pair,
        "timeframe": timeframe,
        "data_start": start_date,
        "data_end": end_date,
    }

    # Persist complete run registry folder and trades
    write_run_registry(run_id, strategy_meta, panel, equity_series, trades_df, runs_dir=runs_dir)

    logger.info("Completed realistic backtest %s: Sharpe: %.2f, Net Return: %.2f%%", run_id, panel.sharpe_ratio, panel.total_return_pct)
    return run_id, panel
