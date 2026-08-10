"""
Portfolio Allocator Backtest & Comparison Engine Module.

Compares historical rebalanced portfolio equity curves and performance metrics under HRP vs Equal-Weight vs Risk Parity
as mandated by Master Plan §16.5 (A8.3).

Context:
    Layer 8 (Portfolio Construction Engine) allocator backtest module specified in Master Plan §16.5.
"""

import logging
from typing import Any, Dict
import numpy as np
import pandas as pd

from src.portfolio.allocator import equal_weight_allocation, hrp_allocation, risk_parity_allocation
from src.portfolio.constraints import apply_portfolio_constraints

logger = logging.getLogger(__name__)


def _calc_portfolio_metrics(pnl_series: pd.Series) -> Dict[str, float]:
    """Calculates summary performance metrics for a portfolio return series."""
    if pnl_series.empty:
        return {"ann_return": 0.0, "sharpe": 0.0, "max_dd": 0.0, "calmar": 0.0}

    ann_ret = float(pnl_series.mean() * 365.0)
    std_val = float(pnl_series.std() * np.sqrt(365.0))
    sharpe = float(ann_ret / std_val) if std_val > 0 else 0.0

    equity = (1.0 + pnl_series).cumprod()
    peak = equity.cummax()
    dd = (peak - equity) / peak
    max_dd = float(dd.max()) if not dd.empty else 0.0

    calmar = float(ann_ret / max_dd) if max_dd > 0 else 0.0

    return {
        "ann_return": round(ann_ret, 4),
        "sharpe": round(sharpe, 4),
        "max_dd": round(max_dd, 4),
        "calmar": round(calmar, 4),
    }


def compare_allocators(
    returns_df: pd.DataFrame,
    rebalance_freq_days: int = 30,
) -> Dict[str, Any]:
    """Compares historical rebalanced portfolio performance under HRP vs Equal-Weight vs Risk Parity (§16.5).

    Args:
        returns_df (pd.DataFrame): Daily strategy returns DataFrame.
        rebalance_freq_days (int): Rebalance period in days. Defaults to 30.

    Returns:
        Dict[str, Any]: Comparison results dictionary containing metrics and equity curves.
    """
    if returns_df.empty or returns_df.shape[1] == 0:
        return {"hrp": {}, "equal": {}, "risk_parity": {}}

    methods = ["hrp", "equal", "risk_parity"]
    results: Dict[str, Any] = {}

    for method in methods:
        portfolio_returns = []
        n_rows = len(returns_df)

        curr_weights = equal_weight_allocation(returns_df)

        for i in range(n_rows):
            # Rebalance on schedule
            if i % rebalance_freq_days == 0 and i >= 30:
                hist_window = returns_df.iloc[max(0, i - 252):i]
                if method == "hrp":
                    raw_w = hrp_allocation(hist_window)
                elif method == "risk_parity":
                    raw_w = risk_parity_allocation(hist_window)
                else:
                    raw_w = equal_weight_allocation(hist_window)

                curr_weights = apply_portfolio_constraints(raw_w, returns_df=hist_window)

            # Daily portfolio return = weighted sum of strategy returns
            row_ret = returns_df.iloc[i]
            p_ret = sum(curr_weights.get(col, 0.0) * row_ret[col] for col in returns_df.columns)
            portfolio_returns.append(p_ret)

        p_series = pd.Series(portfolio_returns, index=returns_df.index)
        metrics = _calc_portfolio_metrics(p_series)

        results[method] = {
            "metrics": metrics,
            "equity_curve": (1.0 + p_series).cumprod().tolist(),
        }

    logger.info("Compared allocators: HRP max_dd=%.4f vs Equal max_dd=%.4f", results["hrp"]["metrics"]["max_dd"], results["equal"]["metrics"]["max_dd"])
    return results
