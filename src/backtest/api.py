"""
Backtest Engine Access API Layer.

Official contract functions `run_screen()` and `run_realistic()` used by downstream modules
and UI command center to execute screening sweeps and realistic backtests.

Context:
    Layer 4 (Backtest Engine) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from src.backtest.metrics import PerformanceMetricsPanel
from src.backtest.runner import execute_realistic_backtest
from src.backtest.vectorbt_engine import run_vectorized_backtest

logger = logging.getLogger(__name__)


def run_screen(strategy_cfg: Dict[str, Any], data: pd.DataFrame, features: Optional[pd.DataFrame] = None) -> Dict[str, Any]:
    """Executes fast screening backtest over input bar DataFrame (§C2.5).

    Args:
        strategy_cfg (Dict[str, Any]): Strategy configuration dictionary.
        data (pd.DataFrame): Input bar DataFrame.
        features (Optional[pd.DataFrame]): Input feature DataFrame.

    Returns:
        Dict[str, Any]: Vectorbt screening summary dictionary.
    """
    t_id = strategy_cfg.get("trigger", "T01")
    f_id = strategy_cfg.get("filter", "F01")
    x_id = strategy_cfg.get("exit", "X01")
    params = strategy_cfg.get("params", {"direction": "long"})

    df_feats = features if features is not None else data

    trades_df, equity_series, panel = run_vectorized_backtest(
        data, df_feats, t_id, f_id, x_id, params
    )
    return panel.to_dict()


def run_realistic(
    strategy_cfg: Dict[str, Any],
    pair: str,
    start: str,
    end: str,
    timeframe: str = "1m",
    data_dir: Optional[Path] = None,
) -> str:
    """Executes full realistic cost-aware backtest and returns generated run_id string (§C2.5).

    Args:
        strategy_cfg (Dict[str, Any]): Strategy configuration dictionary.
        pair (str): Trading pair symbol.
        start (str): Start date string.
        end (str): End date string.
        timeframe (str): Timeframe symbol. Defaults to '1m'.
        data_dir (Optional[Path]): Data directory override.

    Returns:
        str: Generated run_id string.
    """
    run_id, _ = execute_realistic_backtest(
        strategy_cfg, pair, start, end, timeframe=timeframe, data_dir=data_dir
    )
    return run_id
