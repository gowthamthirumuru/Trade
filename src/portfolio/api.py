"""
Portfolio Construction Engine Access API Layer.

Official contract functions `allocate()` and `rebalance()` used by downstream modules
and UI command center to compute portfolio allocations and execute monthly rebalancing (§C2.5).

Context:
    Layer 8 (Portfolio Construction Engine) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from src.portfolio.allocator import equal_weight_allocation, hrp_allocation, mean_cvar_allocation, risk_parity_allocation
from src.portfolio.constraints import apply_portfolio_constraints
from src.portfolio.rebalance import rebalance_portfolio as internal_rebalance_portfolio

logger = logging.getLogger(__name__)


def allocate(
    returns_df: pd.DataFrame,
    method: str = "hrp",
    pair_map: Optional[Dict[str, str]] = None,
    config: Optional[Dict[str, Any]] = None,
) -> Dict[str, float]:
    """Computes constrained strategy allocation weights for input return matrix (§C2.5).

    Args:
        returns_df (pd.DataFrame): Daily strategy returns DataFrame (cols = strategies).
        method (str): Allocation method ('hrp', 'risk_parity', 'mean_cvar', 'equal'). Defaults to 'hrp'.
        pair_map (Optional[Dict[str, str]]): Strategy -> Asset Pair map.
        config (Optional[Dict[str, Any]]): Constraint parameters override.

    Returns:
        Dict[str, float]: Constrained weight dictionary summing to 1.0.
    """
    if method == "hrp":
        raw_w = hrp_allocation(returns_df)
    elif method == "risk_parity":
        raw_w = risk_parity_allocation(returns_df)
    elif method == "mean_cvar":
        raw_w = mean_cvar_allocation(returns_df)
    else:
        raw_w = equal_weight_allocation(returns_df)

    cfg = config or {}
    return apply_portfolio_constraints(
        raw_w,
        returns_df=returns_df,
        pair_map=pair_map,
        max_weight_per_strategy=cfg.get("max_weight_per_strategy", 0.30),
        max_weight_per_pair=cfg.get("max_weight_per_pair", 0.40),
        corr_threshold=cfg.get("corr_threshold", 0.60),
        min_capital_floor=cfg.get("min_capital_floor", 0.05),
    )


def rebalance(
    month: str,
    returns_df: Optional[pd.DataFrame] = None,
    pair_map: Optional[Dict[str, str]] = None,
    method: str = "hrp",
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Executes monthly portfolio rebalancing and persists allocations to DuckDB (§C2.5).

    Args:
        month (str): Rebalance month date string (e.g. '2023-09-01').
        returns_df (Optional[pd.DataFrame]): Strategy daily returns DataFrame.
        pair_map (Optional[Dict[str, str]]): Strategy -> Asset Pair map.
        method (str): Allocation method. Defaults to 'hrp'.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Rebalancing audit summary dictionary.
    """
    df_ret = returns_df if returns_df is not None else pd.DataFrame()
    return internal_rebalance_portfolio(month, df_ret, pair_map=pair_map, method=method, db_path=db_path)
