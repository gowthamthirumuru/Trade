"""
Gate 1 — Out-of-Sample (OOS) Evaluation Module.

Evaluates strategy performance on out-of-sample data segment (post-2022) as mandated by Master Plan §15.3.

Gate 1 Criteria (§15.3):
    - n >= 50 trades in OOS period
    - Expectancy E[R] > 0.0 R net of costs
    - Profit Factor >= 1.15

Context:
    Layer 7 (Validation Lab) Gate 1 component specified in Master Plan §15.3.
"""

import logging
from typing import Any, Dict
import pandas as pd

from src.edge.slice import slice_stats

logger = logging.getLogger(__name__)


def evaluate_oos_gate(
    trades_df: pd.DataFrame,
    oos_start: str = "2023-01-01",
    min_n: int = 50,
    min_pf: float = 1.15,
) -> Dict[str, Any]:
    """Evaluates Gate 1: Out-of-Sample performance check (§15.3).

    Args:
        trades_df (pd.DataFrame): Strategy trade log DataFrame.
        oos_start (str): OOS start date string. Defaults to '2023-01-01'.
        min_n (int): Minimum required OOS trades. Defaults to 50.
        min_pf (float): Minimum required OOS profit factor. Defaults to 1.15.

    Returns:
        Dict[str, Any]: Gate 1 audit results dictionary.
    """
    if trades_df.empty or "entry_time" not in trades_df.columns:
        return {
            "passed": False,
            "gate": "Gate 1: OOS Test",
            "reason": "NO_OOS_DATA",
            "n": 0,
            "expectancy_r": 0.0,
            "profit_factor": 0.0,
        }

    df = trades_df.copy()
    if not pd.api.types.is_datetime64_any_dtype(df["entry_time"]):
        df["entry_time"] = pd.to_datetime(df["entry_time"], utc=True)

    oos_cutoff = pd.Timestamp(oos_start, tz="UTC")
    oos_trades = df[df["entry_time"] >= oos_cutoff]

    if oos_trades.empty:
        return {
            "passed": False,
            "gate": "Gate 1: OOS Test",
            "reason": "NO_OOS_TRADES",
            "n": 0,
            "expectancy_r": 0.0,
            "profit_factor": 0.0,
        }

    stats = slice_stats(oos_trades, min_n=5)
    n = stats["n"]
    exp_r = stats["expectancy_r"]
    pf = stats["profit_factor"]

    passed = (n >= min_n) and (exp_r > 0.0) and (pf >= min_pf)
    reason = "PASS" if passed else ("OOS_N_LOW" if n < min_n else ("OOS_EXP_NEGATIVE" if exp_r <= 0 else "OOS_PF_LOW"))

    logger.info("Gate 1 OOS Test: passed=%s, n=%d, exp=%.2fR, pf=%.2f", passed, n, exp_r, pf)
    return {
        "passed": passed,
        "gate": "Gate 1: OOS Test",
        "reason": reason,
        "n": n,
        "expectancy_r": exp_r,
        "profit_factor": pf,
        "win_rate": stats["win_rate"],
    }
