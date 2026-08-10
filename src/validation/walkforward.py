"""
Gate 2 — Anchored Walk-Forward Analysis Module.

Implements multi-fold expanding window walk-forward optimization and evaluation as mandated by Master Plan §15.3 & §C2.11.7.

Gate 2 Criteria (§15.3):
    - Walk-Forward Efficiency (WFE) = annualized OOS return / annualized IS return >= 0.5
    - Max drawdown in any fold <= 1.5x IS max drawdown.

Context:
    Layer 7 (Validation Lab) Gate 2 component specified in Master Plan §15.3 & §C2.11.7.
"""

import logging
from typing import Any, Callable, Dict, List, Tuple
import numpy as np
import pandas as pd

from src.edge.slice import slice_stats

logger = logging.getLogger(__name__)


def anchored_folds(
    start: str,
    end: str,
    train_years: int = 3,
    test_months: int = 6,
) -> List[Tuple[pd.Timestamp, pd.Timestamp, pd.Timestamp, pd.Timestamp]]:
    """Generates anchored walk-forward train/test fold window pairs (§C2.11.7).

    Args:
        start (str): Data start date.
        end (str): Data end date.
        train_years (int): Training window duration in years. Defaults to 3.
        test_months (int): Test window duration in months. Defaults to 6.

    Returns:
        List[Tuple[pd.Timestamp, pd.Timestamp, pd.Timestamp, pd.Timestamp]]:
            List of (train_start, train_end, test_start, test_end) tuples.
    """
    folds = []
    train_start = pd.Timestamp(start, tz="UTC")
    end_ts = pd.Timestamp(end, tz="UTC")

    while True:
        train_end = train_start + pd.DateOffset(years=train_years)
        test_end = train_end + pd.DateOffset(months=test_months)
        if test_end > end_ts:
            break
        folds.append((train_start, train_end, train_end, test_end))
        train_start += pd.DateOffset(months=test_months)

    return folds


def walk_forward(
    strategy_cfg: Dict[str, Any],
    folds: List[Tuple[pd.Timestamp, pd.Timestamp, pd.Timestamp, pd.Timestamp]],
    optimize_fn: Callable[[Dict[str, Any], pd.Timestamp, pd.Timestamp], Dict[str, Any]],
    evaluate_fn: Callable[[Dict[str, Any], pd.Timestamp, pd.Timestamp], Dict[str, Any]],
    min_wfe: float = 0.5,
    max_dd_mult: float = 1.5,
) -> Dict[str, Any]:
    """Executes anchored walk-forward analysis over generated folds (§C2.11.7).

    Args:
        strategy_cfg (Dict[str, Any]): Base strategy configuration.
        folds (List[Tuple]): Fold timestamp tuples.
        optimize_fn (Callable): In-sample optimization callback (returns best config).
        evaluate_fn (Callable): Evaluation callback (returns performance dict).
        min_wfe (float): Minimum required Walk-Forward Efficiency. Defaults to 0.5.
        max_dd_mult (float): Maximum fold DD multiplier vs IS DD. Defaults to 1.5.

    Returns:
        Dict[str, Any]: Walk-Forward evaluation summary dictionary.
    """
    if not folds:
        return {
            "passed": False,
            "gate": "Gate 2: Walk-Forward",
            "reason": "NO_FOLDS_GENERATED",
            "wfe": 0.0,
            "folds_count": 0,
        }

    fold_results: List[Dict[str, Any]] = []

    for idx, (tr_s, tr_e, te_s, te_e) in enumerate(folds):
        best_cfg = optimize_fn(strategy_cfg, tr_s, tr_e)
        is_metrics = evaluate_fn(best_cfg, tr_s, tr_e)
        oos_metrics = evaluate_fn(best_cfg, te_s, te_e)

        fold_results.append({
            "fold_idx": idx,
            "train_start": tr_s,
            "train_end": tr_e,
            "test_start": te_s,
            "test_end": te_e,
            "is_return": is_metrics.get("ann_return", 0.0),
            "is_dd": is_metrics.get("max_dd", 0.01),
            "oos_return": oos_metrics.get("ann_return", 0.0),
            "oos_dd": oos_metrics.get("max_dd", 0.0),
            "best_cfg": best_cfg,
        })

    is_returns = [f["is_return"] for f in fold_results]
    oos_returns = [f["oos_return"] for f in fold_results]

    mean_is_ret = float(np.mean(is_returns)) if is_returns else 0.0
    mean_oos_ret = float(np.mean(oos_returns)) if oos_returns else 0.0

    wfe = mean_oos_ret / max(mean_is_ret, 1e-9) if mean_is_ret > 0 else 0.0

    # Check drawdown violation in any fold
    max_is_dd = max([f["is_dd"] for f in fold_results] + [0.01])
    dd_violations = [f for f in fold_results if f["oos_dd"] > max_dd_mult * max_is_dd]

    passed = (wfe >= min_wfe) and (len(dd_violations) == 0)
    reason = "PASS" if passed else ("WFE_LOW" if wfe < min_wfe else "FOLD_DD_VIOLATION")

    logger.info("Gate 2 Walk-Forward: passed=%s, WFE=%.2f, folds=%d", passed, wfe, len(folds))
    return {
        "passed": passed,
        "gate": "Gate 2: Walk-Forward",
        "reason": reason,
        "wfe": round(float(wfe), 4),
        "mean_is_return": round(mean_is_ret, 4),
        "mean_oos_return": round(mean_oos_ret, 4),
        "folds_count": len(folds),
        "fold_results": fold_results,
    }
