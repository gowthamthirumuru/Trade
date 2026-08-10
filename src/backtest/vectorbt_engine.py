"""
Vectorized Screening Backtest Engine Module.

High-speed vectorized backtest screening wrapper implementing cost-aware next-bar fill rules
and intrabar conservatism as mandated by Master Plan §12.2 & §12.3.

Rules (§12.3):
    - Costs: 5 bps taker fee + 2 bps slippage per side (14 bps round trip)
    - Entry Fill: Next-bar open (signal at t executes at open of t+1, NO same-bar fills)
    - Intrabar Conservatism: If SL and TP are both inside a bar's OHLC range, pessimistic SL hit first.

Context:
    Layer 4 (Backtest Engine) screening component specified in Master Plan §12.2.
"""

import logging
from typing import Any, Dict, Optional, Tuple
import numpy as np
import pandas as pd

from src.backtest.config import BacktestCostConfig, FillRulesConfig
from src.backtest.metrics import PerformanceMetricsPanel, calculate_metrics_panel
from src.miner.building_blocks import BLOCK_REGISTRY

logger = logging.getLogger(__name__)


def run_vectorized_backtest(
    df_bars: pd.DataFrame,
    df_features: pd.DataFrame,
    trigger_id: str,
    filter_id: str,
    exit_id: str,
    params: Dict[str, Any],
    cost_config: Optional[BacktestCostConfig] = None,
    fill_rules: Optional[FillRulesConfig] = None,
    initial_capital: float = 10000.0,
) -> Tuple[pd.DataFrame, pd.Series, PerformanceMetricsPanel]:
    """Executes a vectorized backtest with strict cost modeling and next-bar open fill enforcement.

    Args:
        df_bars (pd.DataFrame): Raw bar DataFrame.
        df_features (pd.DataFrame): Materialized feature DataFrame.
        trigger_id (str): Entry trigger block ID (e.g. 'T01').
        filter_id (str): Entry filter block ID (e.g. 'F01').
        exit_id (str): Exit model block ID (e.g. 'X01').
        params (Dict[str, Any]): Strategy parameters.
        cost_config (Optional[BacktestCostConfig]): Cost configuration override.
        fill_rules (Optional[FillRulesConfig]): Fill rules override.
        initial_capital (float): Starting portfolio balance. Defaults to 10000.0.

    Returns:
        Tuple[pd.DataFrame, pd.Series, PerformanceMetricsPanel]:
            - Labeled Trade Log DataFrame
            - Bar-by-bar Equity Series
            - Full Performance Metrics Panel
    """
    costs = cost_config or BacktestCostConfig()
    fills = fill_rules or FillRulesConfig()

    trigger_fn = BLOCK_REGISTRY[trigger_id]["fn"]
    filter_fn = BLOCK_REGISTRY[filter_id]["fn"]
    exit_fn = BLOCK_REGISTRY[exit_id]["fn"]

    # Compute entry signals
    trigger_sig = trigger_fn(df_bars, df_features, params)
    filter_sig = filter_fn(df_bars, df_features, params)
    entry_signal = trigger_sig & filter_sig

    exit_signal = exit_fn(df_bars, df_features, entry_signal, params)

    pair_name = params.get("pair", df_bars.get("pair", pd.Series(["BTCUSDT"])).iloc[0])
    timeframe = params.get("timeframe", df_bars.get("timeframe", pd.Series(["1m"])).iloc[0])

    trades: List[Dict[str, Any]] = []
    equity = np.full(len(df_bars), initial_capital, dtype=float)
    current_equity = initial_capital

    entry_indices = np.where(entry_signal)[0]
    round_trip_cost = costs.round_trip_cost_pct

    k_sl = params.get("k_sl", 1.0)
    m_tp = params.get("m_tp", 2.0)
    atr = df_features.get("atr_14", df_bars["close"] * 0.01)

    direction = str(params.get("direction", "long")).lower()

    for i, idx in enumerate(entry_indices):
        # RULE A4.3: Next-bar open fill rule (signal at bar t executes at open of t+1)
        if idx + 1 >= len(df_bars):
            continue

        entry_idx = idx + 1
        entry_time = df_bars["open_time"].iloc[entry_idx]
        entry_price = float(df_bars["open"].iloc[entry_idx])

        target_atr = float(atr.iloc[entry_idx])
        if direction == "short":
            sl_price = entry_price + (k_sl * target_atr)
            tp_price = entry_price - (m_tp * target_atr)
        else:
            sl_price = entry_price - (k_sl * target_atr)
            tp_price = entry_price + (m_tp * target_atr)

        exit_idx = min(entry_idx + 12, len(df_bars) - 1)
        exit_reason = "time"
        exit_price = float(df_bars["close"].iloc[exit_idx])

        # Scan intrabar for SL / TP hits
        for search_i in range(entry_idx, min(entry_idx + 24, len(df_bars))):
            b_high = float(df_bars["high"].iloc[search_i])
            b_low = float(df_bars["low"].iloc[search_i])

            if direction == "short":
                sl_hit = b_high >= sl_price
                tp_hit = b_low <= tp_price
            else:
                sl_hit = b_low <= sl_price
                tp_hit = b_high >= tp_price

            # RULE A4.4: Intrabar Conservative Rule (if both hit in same bar, SL recorded first)
            if sl_hit and tp_hit:
                exit_idx = search_i
                exit_price = sl_price
                exit_reason = "sl"
                break
            elif sl_hit:
                exit_idx = search_i
                exit_price = sl_price
                exit_reason = "sl"
                break
            elif tp_hit:
                exit_idx = search_i
                exit_price = tp_price
                exit_reason = "tp"
                break

        exit_time = df_bars["open_time"].iloc[exit_idx]
        bars_held = max(exit_idx - entry_idx, 1)

        if direction == "short":
            raw_ret = (entry_price - exit_price) / entry_price
        else:
            raw_ret = (exit_price - entry_price) / entry_price

        net_ret = raw_ret - round_trip_cost
        pnl_quote = current_equity * 0.0075 * net_ret / 0.01  # Fixed 0.75% risk per trade
        pnl_pct = net_ret
        pnl_r = net_ret / 0.01

        current_equity += pnl_quote
        equity[exit_idx:] = current_equity

        # Track Adverse Excursions (MAE / MFE)
        trade_bars = df_bars.iloc[entry_idx : exit_idx + 1]
        if direction == "short":
            mae_pct = ((entry_price - float(trade_bars["high"].max())) / entry_price) * 100.0
            mfe_pct = ((entry_price - float(trade_bars["low"].min())) / entry_price) * 100.0
        else:
            mae_pct = ((float(trade_bars["low"].min()) - entry_price) / entry_price) * 100.0
            mfe_pct = ((float(trade_bars["high"].max()) - entry_price) / entry_price) * 100.0

        trades.append({
            "trade_id": i + 1,
            "strategy": f"strategy_{trigger_id}_{filter_id}",
            "pair": pair_name,
            "timeframe": timeframe,
            "direction": direction,
            "entry_time": entry_time,
            "exit_time": exit_time,
            "entry_price": round(entry_price, 4),
            "exit_price": round(exit_price, 4),
            "qty": round(current_equity * 0.0075 / (entry_price * 0.01), 4),
            "pnl_quote": round(pnl_quote, 2),
            "pnl_pct": round(pnl_pct, 4),
            "pnl_r": round(pnl_r, 4),
            "fees": round(costs.taker_fee_bps * 2.0, 2),
            "slippage": round(costs.slippage_bps * 2.0, 2),
            "mae_pct": round(mae_pct, 2),
            "mfe_pct": round(mfe_pct, 2),
            "bars_held": bars_held,
            "exit_reason": exit_reason,
            "source": "backtest",
        })

    trades_df = pd.DataFrame(trades)
    equity_series = pd.Series(equity, index=df_bars["open_time"])

    panel = calculate_metrics_panel(trades_df, equity_series, initial_capital=initial_capital)

    logger.debug("Executed vectorized backtest: %d trades, Sharpe: %.2f", len(trades_df), panel.sharpe_ratio)
    return trades_df, equity_series, panel
