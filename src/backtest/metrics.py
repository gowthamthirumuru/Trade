"""
Backtest Summary Metrics Panel Module.

Calculates the full panel of quantitative performance metrics as specified in Master Plan §12.5.

Metrics Panel (§12.5):
    - Net Return (%), CAGR (%)
    - Annualized Sharpe Ratio (365 days for crypto), Sortino Ratio, Calmar Ratio
    - Max Drawdown (%), Max Drawdown Duration (bars)
    - Profit Factor, Expectancy (R & bps), Win Rate (%)
    - Payoff Ratio, Avg Win / Avg Loss (R), Total Trade Count (n)
    - Avg Holding Time (bars), Exposure (%), Tail Ratio, Return Skewness
    - 95th Percentile Daily Loss (%)

Context:
    Layer 4 (Backtest Engine) metrics panel specified in Master Plan §12.5.
"""

from dataclasses import asdict, dataclass
import logging
from typing import Any, Dict, List
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class PerformanceMetricsPanel:
    """Full quantitative performance metrics container (§12.5)."""

    total_return_pct: float = 0.0
    cagr_pct: float = 0.0
    sharpe_ratio: float = 0.0
    sortino_ratio: float = 0.0
    calmar_ratio: float = 0.0
    max_drawdown_pct: float = 0.0
    max_drawdown_duration_bars: int = 0
    profit_factor: float = 0.0
    expectancy_r: float = 0.0
    expectancy_bps: float = 0.0
    win_rate_pct: float = 0.0
    payoff_ratio: float = 0.0
    avg_win_r: float = 0.0
    avg_loss_r: float = 0.0
    total_trades: int = 0
    avg_holding_time_bars: float = 0.0
    exposure_pct: float = 0.0
    tail_ratio: float = 0.0
    skewness: float = 0.0
    p95_daily_loss_pct: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        """Returns metrics as serializable dictionary."""
        return asdict(self)


def calculate_metrics_panel(
    trades_df: pd.DataFrame,
    equity_series: pd.Series,
    initial_capital: float = 10000.0,
    annualization_factor: float = 365.0,
) -> PerformanceMetricsPanel:
    """Calculates full quantitative performance panel from trade log and equity curve (§12.5).

    Args:
        trades_df (pd.DataFrame): Trade log DataFrame containing 'pnl_r', 'pnl_pct', 'bars_held'.
        equity_series (pd.Series): Bar-by-bar portfolio equity series.
        initial_capital (float): Starting portfolio capital. Defaults to 10000.0.
        annualization_factor (float): Crypto 365-day annualization factor. Defaults to 365.0.

    Returns:
        PerformanceMetricsPanel: Calculated metrics panel object.
    """
    panel = PerformanceMetricsPanel()
    if equity_series.empty or len(equity_series) < 2:
        return panel

    final_equity = equity_series.iloc[-1]
    total_return_pct = ((final_equity - initial_capital) / initial_capital) * 100.0
    panel.total_return_pct = round(total_return_pct, 2)

    # Calculate Drawdown and Max Drawdown Duration
    rolling_peak = equity_series.cummax()
    drawdown = (equity_series - rolling_peak) / rolling_peak
    max_dd = float(drawdown.min())  # Negative value
    panel.max_drawdown_pct = round(abs(max_dd) * 100.0, 2)

    # Calculate Max Drawdown Duration (bars)
    in_dd = drawdown < 0
    dd_runs = (~in_dd).cumsum()[in_dd]
    if not dd_runs.empty:
        max_dd_duration = int(in_dd.groupby(dd_runs).sum().max())
    else:
        max_dd_duration = 0
    panel.max_drawdown_duration_bars = max_dd_duration

    # Calculate Daily Returns for Sharpe / Sortino / Calmar
    daily_equity = equity_series.resample("1D").last().dropna() if isinstance(equity_series.index, pd.DatetimeIndex) else equity_series
    daily_returns = daily_equity.pct_change().dropna()

    if len(daily_returns) > 1 and daily_returns.std() > 0:
        mean_ret = daily_returns.mean()
        std_ret = daily_returns.std()
        panel.sharpe_ratio = round(float((mean_ret / std_ret) * np.sqrt(annualization_factor)), 2)

        # Sortino: Downside Deviation
        downside_returns = daily_returns[daily_returns < 0]
        downside_std = downside_returns.std() if len(downside_returns) > 0 else 1e-9
        panel.sortino_ratio = round(float((mean_ret / max(downside_std, 1e-9)) * np.sqrt(annualization_factor)), 2)

        # CAGR and Calmar
        total_days = max(len(daily_returns), 1)
        cagr = ((final_equity / initial_capital) ** (365.0 / total_days) - 1.0) * 100.0
        panel.cagr_pct = round(cagr, 2)
        panel.calmar_ratio = round(float(cagr / max(panel.max_drawdown_pct, 1e-9)), 2)

        # Skew and 95th Percentile Daily Loss
        panel.skewness = round(float(daily_returns.skew()), 2)
        p95_loss = np.percentile(daily_returns, 5) * 100.0
        panel.p95_daily_loss_pct = round(float(p95_loss), 2)

    # Trade-based Metrics
    if not trades_df.empty and "pnl_r" in trades_df.columns:
        n_trades = len(trades_df)
        panel.total_trades = n_trades

        pnl_r = trades_df["pnl_r"].values
        wins = pnl_r[pnl_r > 0]
        losses = pnl_r[pnl_r <= 0]

        win_rate = len(wins) / n_trades * 100.0
        panel.win_rate_pct = round(win_rate, 2)

        expectancy_r = float(np.mean(pnl_r))
        panel.expectancy_r = round(expectancy_r, 4)

        if "pnl_pct" in trades_df.columns:
            panel.expectancy_bps = round(float(np.mean(trades_df["pnl_pct"].values * 10000.0)), 2)

        gross_gain = float(np.sum(wins)) if len(wins) > 0 else 0.0
        gross_loss = float(np.abs(np.sum(losses))) if len(losses) > 0 else 1e-9
        panel.profit_factor = round(gross_gain / max(gross_loss, 1e-9), 2)

        avg_win = float(np.mean(wins)) if len(wins) > 0 else 0.0
        avg_loss = float(np.abs(np.mean(losses))) if len(losses) > 0 else 1e-9
        panel.avg_win_r = round(avg_win, 4)
        panel.avg_loss_r = round(avg_loss, 4)
        panel.payoff_ratio = round(avg_win / max(avg_loss, 1e-9), 2)

        if "bars_held" in trades_df.columns:
            panel.avg_holding_time_bars = round(float(np.mean(trades_df["bars_held"].values)), 1)
            total_bars_in_market = int(np.sum(trades_df["bars_held"].values))
            panel.exposure_pct = round(min((total_bars_in_market / max(len(equity_series), 1)) * 100.0, 100.0), 2)

        # Tail Ratio: 95th percentile return / abs(5th percentile return)
        p95_ret = np.percentile(pnl_r, 95)
        p05_ret = abs(np.percentile(pnl_r, 5))
        panel.tail_ratio = round(float(p95_ret / max(p05_ret, 1e-9)), 2)

    return panel
