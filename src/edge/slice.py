"""
Slice Statistics Engine Module.

Calculates quantitative summary statistics and bootstrap confidence intervals for arbitrary trade slices
as mandated by Master Plan §14.2 & §C2.11.4.

Metrics Computed (§14.2):
    - n (trade sample size)
    - expectancy_r (E[R] in R-multiples)
    - expectancy_bps (E[R] in basis points)
    - win_rate (fraction of winning trades)
    - profit_factor (gross profit / |gross loss|)
    - avg_win_r, avg_loss_r
    - max_consec_loss (maximum consecutive losing trades)
    - t_stat, p_value (1-sample t-test against H0: E[R] = 0)
    - ci95 (95% bootstrap confidence interval [lower, upper])
    - reliable (True if n >= 100)

Context:
    Layer 6 (Edge Analytics Engine) slice engine specified in Master Plan §14.2 & §C2.11.4.
"""

import logging
from typing import Any, Dict, Tuple
import numpy as np
import pandas as pd
from scipy import stats

logger = logging.getLogger(__name__)


def max_consecutive_losses(loss_mask: pd.Series) -> int:
    """Calculates maximum consecutive losing trades in boolean series.

    Args:
        loss_mask (pd.Series): Boolean series where True indicates a loss.

    Returns:
        int: Maximum consecutive count of True values.
    """
    if loss_mask.empty or not loss_mask.any():
        return 0
    groups = (~loss_mask).cumsum()
    return int(loss_mask.groupby(groups).sum().max())


def bootstrap_ci(
    pnl_r: np.ndarray,
    n_boot: int = 5000,
    seed: int = 42,
) -> Tuple[float, float]:
    """Calculates 95% bootstrap confidence interval for mean R return (§C2.11.4).

    Args:
        pnl_r (np.ndarray): 1D array of trade R returns.
        n_boot (int): Number of bootstrap iterations. Defaults to 5000.
        seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Tuple[float, float]: 95% confidence interval lower and upper bounds.
    """
    if len(pnl_r) < 2:
        val = float(pnl_r[0]) if len(pnl_r) == 1 else 0.0
        return (val, val)

    rng = np.random.default_rng(seed)
    boot_indices = rng.integers(0, len(pnl_r), size=(n_boot, len(pnl_r)))
    boot_means = np.mean(pnl_r[boot_indices], axis=1)
    lower = float(np.percentile(boot_means, 2.5))
    upper = float(np.percentile(boot_means, 97.5))
    return (round(lower, 4), round(upper, 4))


def slice_stats(df: pd.DataFrame, min_n: int = 10) -> Dict[str, Any]:
    """Calculates quantitative summary panel for input trade DataFrame slice (§14.2).

    Args:
        df (pd.DataFrame): Trade slice DataFrame containing 'pnl_r'.
        min_n (int): Minimum required trades threshold. Defaults to 10.

    Returns:
        Dict[str, Any]: Complete slice statistics dictionary.
    """
    n = len(df)
    if n < min_n or "pnl_r" not in df.columns:
        return {
            "n": n,
            "reliable": False,
            "expectancy_r": 0.0,
            "expectancy_bps": 0.0,
            "win_rate": 0.0,
            "profit_factor": 0.0,
            "avg_win_r": 0.0,
            "avg_loss_r": 0.0,
            "max_consec_loss": 0,
            "t_stat": 0.0,
            "p_value": 1.0,
            "ci95": (0.0, 0.0),
        }

    r = df["pnl_r"].values.astype(float)
    wins = r[r > 0]
    losses = r[r <= 0]

    mean_r = float(np.mean(r))
    std_r = float(np.std(r, ddof=1)) if len(r) > 1 else 1e-9

    win_rate = float(np.mean(r > 0))
    gross_gain = float(np.sum(wins)) if len(wins) > 0 else 0.0
    gross_loss = float(np.abs(np.sum(losses))) if len(losses) > 0 else 1e-12
    profit_factor = float(gross_gain / max(gross_loss, 1e-12))

    avg_win = float(np.mean(wins)) if len(wins) > 0 else 0.0
    avg_loss = float(np.abs(np.mean(losses))) if len(losses) > 0 else 0.0

    # Calculate 1-sample t-test against H0: mean = 0
    if len(r) > 1 and std_r > 0:
        t_stat, p_val = stats.ttest_1samp(r, 0.0)
        t_stat = float(t_stat)
        p_val = float(p_val)
    else:
        t_stat = 0.0
        p_val = 1.0

    ci_lower, ci_upper = bootstrap_ci(r)
    consec_loss = max_consecutive_losses(pd.Series(r <= 0))

    expectancy_bps = float(np.mean(df["pnl_pct"].values * 10000.0)) if "pnl_pct" in df.columns else mean_r * 100.0

    return {
        "n": n,
        "reliable": n >= 100,
        "expectancy_r": round(mean_r, 4),
        "expectancy_bps": round(expectancy_bps, 2),
        "std_r": round(std_r, 4),
        "win_rate": round(win_rate, 4),
        "profit_factor": round(profit_factor, 2),
        "avg_win_r": round(avg_win, 4),
        "avg_loss_r": round(avg_loss, 4),
        "max_consec_loss": consec_loss,
        "t_stat": round(t_stat, 4),
        "p_value": round(p_val, 6),
        "ci95": (ci_lower, ci_upper),
    }
