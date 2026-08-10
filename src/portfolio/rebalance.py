"""
Monthly Portfolio Rebalancing Module.

Executes monthly portfolio rebalancing, applies constraint guard layer, tracks turnover penalties,
and persists allocation records into DuckDB as mandated by Master Plan §16.3 & §21.

Context:
    Layer 8 (Portfolio Construction Engine) monthly rebalancer specified in Master Plan §16.3 & §21.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import duckdb
import pandas as pd

from src.portfolio.allocator import equal_weight_allocation, hrp_allocation, mean_cvar_allocation, risk_parity_allocation
from src.portfolio.constraints import apply_portfolio_constraints
from src.tradesdb.api import query
from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def rebalance_portfolio(
    month: str,
    returns_df: pd.DataFrame,
    pair_map: Optional[Dict[str, str]] = None,
    method: str = "hrp",
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Executes monthly portfolio rebalancing and persists allocations to DuckDB (§16.3 & §21).

    Args:
        month (str): Rebalance month date string (e.g. '2023-09-01').
        returns_df (pd.DataFrame): Daily strategy returns DataFrame (cols = strategies).
        pair_map (Optional[Dict[str, str]]): Strategy -> Asset Pair map.
        method (str): Allocation method ('hrp', 'risk_parity', 'mean_cvar', 'equal'). Defaults to 'hrp'.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Rebalancing audit summary dictionary including weights and turnover.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    # 1. Calculate raw allocation weights
    if method == "hrp":
        raw_weights = hrp_allocation(returns_df)
    elif method == "risk_parity":
        raw_weights = risk_parity_allocation(returns_df)
    elif method == "mean_cvar":
        raw_weights = mean_cvar_allocation(returns_df)
    else:
        raw_weights = equal_weight_allocation(returns_df)

    # 2. Apply Portfolio Constraint Guard Layer
    final_weights = apply_portfolio_constraints(
        raw_weights,
        returns_df=returns_df,
        pair_map=pair_map,
    )

    # 3. Calculate Turnover Diff vs Previous Month
    prev_weights: Dict[str, float] = {}
    try:
        prev_alloc = query(
            "SELECT strategy, weight FROM allocations WHERE method = ? AND month < CAST(? AS DATE) ORDER BY month DESC",
            {"1": method, "2": month},
            db_path=target_db,
        )
        if not prev_alloc.empty:
            prev_weights = dict(zip(prev_alloc["strategy"], prev_alloc["weight"]))
    except Exception as exc:
        logger.debug("No previous allocations found: %s", exc)

    turnover = 0.0
    if prev_weights:
        all_keys = set(final_weights.keys()).union(set(prev_weights.keys()))
        turnover = sum(abs(final_weights.get(k, 0.0) - prev_weights.get(k, 0.0)) for k in all_keys)

    # 4. Persist to DuckDB allocations table
    m_date = pd.Timestamp(month).strftime("%Y-%m-%d")
    con = duckdb.connect(str(target_db))
    for strat, weight in final_weights.items():
        con.execute(
            """
            INSERT INTO allocations (month, strategy, weight, method, created_at)
            VALUES (CAST(? AS DATE), ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (month, strategy, method) DO UPDATE SET weight = EXCLUDED.weight, created_at = now()
            """,
            [m_date, strat, float(weight), method],
        )
    con.close()

    logger.info("Rebalanced portfolio for month %s (method=%s, strategies=%d, turnover=%.2f)", m_date, method, len(final_weights), turnover)
    return {
        "month": m_date,
        "method": method,
        "weights": final_weights,
        "turnover": round(float(turnover), 4),
        "strategies_count": len(final_weights),
    }
