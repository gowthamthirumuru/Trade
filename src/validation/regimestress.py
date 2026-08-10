"""
Gate 4 — Regime Stress Matrix Module.

Evaluates strategy P&L performance across all 6 trend x volatility regime cells as mandated by Master Plan §15.3.

Gate 4 Criteria (§15.3):
    - No regime cell with expectancy < -0.30 R when sample size n >= 30.

Context:
    Layer 7 (Validation Lab) Gate 4 component specified in Master Plan §15.3.
"""

import logging
from typing import Any, Dict, List
import pandas as pd

from src.edge.slice import slice_stats

logger = logging.getLogger(__name__)


def evaluate_regime_stress(
    trades_df: pd.DataFrame,
    min_cell_n: int = 30,
    max_cell_loss_limit_r: float = -0.30,
) -> Dict[str, Any]:
    """Evaluates Gate 4: Regime Stress Matrix check (§15.3).

    Args:
        trades_df (pd.DataFrame): Strategy trade log DataFrame.
        min_cell_n (int): Minimum required cell trades to enforce loss limit. Defaults to 30.
        max_cell_loss_limit_r (float): Maximum allowed cell negative expectancy R limit. Defaults to -0.30 R.

    Returns:
        Dict[str, Any]: Gate 4 audit results dictionary.
    """
    if trades_df.empty or "pnl_r" not in trades_df.columns:
        return {"passed": False, "gate": "Gate 4: Regime Stress", "reason": "NO_TRADES"}

    df = trades_df.copy()
    if "trend_regime" not in df.columns:
        df["trend_regime"] = "range"
    if "vol_regime" not in df.columns:
        df["vol_regime"] = "mid"

    trends = ["up", "down", "range"]
    vols = ["low", "high"]

    cell_results: List[Dict[str, Any]] = []
    failing_cells: List[Dict[str, Any]] = []

    for t_reg in trends:
        for v_reg in vols:
            cell_df = df[(df["trend_regime"] == t_reg) & (df["vol_regime"] == v_reg)]
            stats = slice_stats(cell_df, min_n=5)

            cell_info = {
                "trend_regime": t_reg,
                "vol_regime": v_reg,
                "n": stats["n"],
                "expectancy_r": stats["expectancy_r"],
                "win_rate": stats["win_rate"],
            }
            cell_results.append(cell_info)

            if stats["n"] >= min_cell_n and stats["expectancy_r"] < max_cell_loss_limit_r:
                failing_cells.append(cell_info)

    passed = len(failing_cells) == 0
    reason = "PASS" if passed else "REGIME_FRAGILE"

    logger.info("Gate 4 Regime Stress: passed=%s, failing_cells=%d", passed, len(failing_cells))
    return {
        "passed": passed,
        "gate": "Gate 4: Regime Stress",
        "reason": reason,
        "cell_results": cell_results,
        "failing_cells": failing_cells,
    }
