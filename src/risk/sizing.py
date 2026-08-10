"""
Position Sizing Engine Module.

Calculates volatility-targeted and risk-budgeted position sizes with confidence stage scaling, edge-decay multipliers,
fractional Kelly caps, and maximum single-position exposure caps as mandated by Master Plan §17.2.

Sizing Formula (§17.2):
    risk_per_trade_pct = base_risk * confidence_mult * decay_mult
    base_risk = 0.75% of equity (0.0075)
    confidence_mult = 0.75 (provisional) | 1.0 (validated) | 1.25 (validated + 100 live trades)
    decay_mult = 0.0 .. 1.0 (edge-decay output)

    position_value = (equity * risk_per_trade_pct) / stop_distance_pct * portfolio_weight
    qty = position_value / entry_price

Context:
    Layer 9 (Risk Engine) position sizing engine specified in Master Plan §17.2.
"""

import logging
from typing import Any, Dict, Optional
import numpy as np

logger = logging.getLogger(__name__)

CONFIDENCE_MAP = {
    "provisional": 0.75,
    "validated": 1.0,
    "core": 1.25,
}


def kelly_fraction_cap(win_rate: float, avg_win_r: float, avg_loss_r: float) -> float:
    """Calculates quarter-Kelly (f* / 4) max risk fraction (§17.2 & §22).

    Args:
        win_rate (float): Historical strategy win rate (0..1).
        avg_win_r (float): Average winning trade return in R.
        avg_loss_r (float): Average losing trade return in R.

    Returns:
        float: Max quarter-Kelly risk fraction cap.
    """
    if win_rate <= 0 or avg_win_r <= 0 or avg_loss_r <= 0:
        return 0.0

    payoff = avg_win_r / avg_loss_r
    full_kelly = win_rate - ((1.0 - win_rate) / payoff)
    quarter_kelly = max(0.0, full_kelly / 4.0)
    return float(quarter_kelly)


def calculate_position_size(
    equity: float,
    stop_distance_pct: float,
    entry_price: float = 100.0,
    portfolio_weight: float = 1.0,
    confidence_stage: str = "validated",
    decay_mult: float = 1.0,
    base_risk_pct: float = 0.0075,
    max_position_exposure_pct: float = 0.20,
    win_rate: Optional[float] = None,
    avg_win_r: Optional[float] = None,
    avg_loss_r: Optional[float] = None,
) -> Dict[str, Any]:
    """Calculates trade position size, risk amount, and token quantity (§17.2).

    Args:
        equity (float): Current portfolio equity in quote currency (e.g. USDT).
        stop_distance_pct (float): Distance from entry price to stop loss (e.g. 0.02 for 2%).
        entry_price (float): Asset entry price. Defaults to 100.0.
        portfolio_weight (float): Module 8 portfolio allocation weight (0..1). Defaults to 1.0.
        confidence_stage (str): Strategy confidence stage ('provisional', 'validated', 'core'). Defaults to 'validated'.
        decay_mult (float): Edge-decay multiplier (0.0..1.0). Defaults to 1.0.
        base_risk_pct (float): Base risk fraction of equity per trade. Defaults to 0.0075 (0.75%).
        max_position_exposure_pct (float): Max allowed position value fraction of equity. Defaults to 0.20.
        win_rate (Optional[float]): Strategy win rate for Kelly check.
        avg_win_r (Optional[float]): Avg win R for Kelly check.
        avg_loss_r (Optional[float]): Avg loss R for Kelly check.

    Returns:
        Dict[str, Any]: Position sizing audit dictionary containing risk_pct, risk_amount, position_value, and qty.
    """
    if equity <= 0 or stop_distance_pct <= 0 or entry_price <= 0 or decay_mult <= 0:
        return {
            "risk_pct": 0.0,
            "risk_amount": 0.0,
            "position_value": 0.0,
            "qty": 0.0,
            "status": "ZERO_SIZE",
        }

    conf_mult = CONFIDENCE_MAP.get(confidence_stage.lower(), 1.0)
    risk_pct = base_risk_pct * conf_mult * decay_mult

    # Kelly Fraction Cap Check
    if win_rate is not None and avg_win_r is not None and avg_loss_r is not None:
        q_kelly = kelly_fraction_cap(win_rate, avg_win_r, avg_loss_r)
        if q_kelly > 0:
            risk_pct = min(risk_pct, q_kelly)

    risk_amount = equity * risk_pct
    raw_pos_value = (risk_amount / max(stop_distance_pct, 1e-4)) * portfolio_weight

    # Max Position Exposure Cap (max 20% of equity)
    max_allowed_pos_value = equity * max_position_exposure_pct
    pos_value = min(raw_pos_value, max_allowed_pos_value)

    qty = pos_value / entry_price

    logger.info("Sized position: equity=%.2f, risk_pct=%.4f, risk_amt=%.2f, pos_val=%.2f, qty=%.4f", equity, risk_pct, risk_amount, pos_value, qty)
    return {
        "risk_pct": round(float(risk_pct), 6),
        "risk_amount": round(float(risk_amount), 2),
        "position_value": round(float(pos_value), 2),
        "qty": round(float(qty), 6),
        "confidence_stage": confidence_stage,
        "decay_mult": decay_mult,
        "portfolio_weight": portfolio_weight,
        "status": "SIZED",
    }
