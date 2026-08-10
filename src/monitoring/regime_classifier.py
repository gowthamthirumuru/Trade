"""
Regime Absence vs Edge Death Classifier Module.

Distinguishes between Regime Absence (favored regime is simply not occurring in market)
and True Edge Death (strategy failing within its target regime) as mandated by Master Plan §20.2 & A12.2.

Context:
    Layer 12 (Monitoring & Edge-Decay Detection) classifier specified in Master Plan §20.2 & A12.2.
"""

import logging
from typing import Any, Dict
import pandas as pd

logger = logging.getLogger(__name__)


def classify_decay_reason(
    strategy: str,
    live_trades_df: pd.DataFrame,
    favored_regime: str = "up",
    regime_col: str = "trend_regime",
    min_regime_trades: int = 15,
) -> Dict[str, Any]:
    """Classifies performance degradation into REGIME_ABSENT vs EDGE_DEATH (§20.2 & A12.2).

    Args:
        strategy (str): Strategy identifier.
        live_trades_df (pd.DataFrame): DataFrame of live trades containing regime labels and pnl_r.
        favored_regime (str): Strategy's target favored regime (e.g. 'up' or 'high').
        regime_col (str): Regime column name in trades DataFrame.
        min_regime_trades (int): Minimum required trades in favored regime to judge edge death.

    Returns:
        Dict[str, Any]: Classification verdict dictionary.
    """
    if live_trades_df.empty or regime_col not in live_trades_df.columns:
        return {
            "strategy": strategy,
            "classification": "INSUFFICIENT_DATA",
            "action": "WAIT",
            "reason": "No live trade data or regime column available",
        }

    favored_df = live_trades_df[live_trades_df[regime_col] == favored_regime]
    n_favored = len(favored_df)

    if n_favored < min_regime_trades:
        # Favored regime is simply absent or has too few trades -> REGIME_ABSENT (Wait)
        logger.info("Regime Classifier [%s]: Favored regime '%s' absent (n=%d < %d) -> REGIME_ABSENT", strategy, favored_regime, n_favored, min_regime_trades)
        return {
            "strategy": strategy,
            "classification": "REGIME_ABSENT",
            "action": "WAIT",
            "favored_regime_count": n_favored,
            "reason": f"Favored regime '{favored_regime}' absent ({n_favored} trades) — wait for regime to return",
        }

    # Evaluate mean return inside favored regime
    favored_exp_r = float(favored_df["pnl_r"].mean()) if "pnl_r" in favored_df.columns else 0.0

    if favored_exp_r <= 0.0:
        # Performance degraded EVEN inside favored regime -> True EDGE_DEATH (Bench)
        logger.warning("Regime Classifier [%s]: Edge failing inside favored regime '%s' (E[R]=%.2fR) -> EDGE_DEATH", strategy, favored_regime, favored_exp_r)
        return {
            "strategy": strategy,
            "classification": "EDGE_DEATH",
            "action": "BENCH_STRATEGY",
            "favored_regime_count": n_favored,
            "favored_exp_r": round(favored_exp_r, 4),
            "reason": f"Strategy edge failed inside favored regime '{favored_regime}' (E[R]={favored_exp_r:.2f}R)",
        }

    # Performance intact in favored regime, overall sluggishness due to regime mix
    return {
        "strategy": strategy,
        "classification": "REGIME_MIX_SLUGGISH",
        "action": "OK",
        "favored_regime_count": n_favored,
        "favored_exp_r": round(favored_exp_r, 4),
        "reason": f"Edge intact in favored regime '{favored_regime}' (E[R]={favored_exp_r:.2f}R)",
    }
