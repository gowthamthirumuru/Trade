"""
Forex Cost & Financing Engine Module.

Implements Chapter 23 Forex Cost Model (§23 Item 3):
    - Session-variable spreads (1.0 pips overlap, 2.5 pips Asia/off-hours).
    - Swap/rollover financing rates for multi-day holds (Wednesday 3x triple swap rule).
    - Zero taker fee (spread IS the cost).

Context:
    Layer 4 / Layer 9 Forex Cost & Risk Model specified in Master Plan Chapter 23.
"""

from dataclasses import dataclass, field
import logging
from typing import Dict, Optional
import pandas as pd

logger = logging.getLogger(__name__)

# Default PIP values by pair
PIP_VALUES: Dict[str, float] = {
    "EURUSD": 0.0001,
    "GBPUSD": 0.0001,
    "USDCHF": 0.0001,
    "USDCAD": 0.0001,
    "AUDUSD": 0.0001,
    "NZDUSD": 0.0001,
    "USDJPY": 0.01,
}

# Base major spreads in pips
BASE_SPREADS_PIPS: Dict[str, float] = {
    "EURUSD": 1.0,
    "GBPUSD": 1.4,
    "USDJPY": 1.2,
    "USDCHF": 1.5,
    "USDCAD": 1.6,
    "AUDUSD": 1.4,
    "NZDUSD": 1.8,
}

# Session spread multipliers (§23 Item 3)
SESSION_SPREAD_MULTIPLIERS: Dict[str, float] = {
    "overlap": 1.0,
    "london": 1.2,
    "ny": 1.2,
    "asia": 2.2,
    "off": 3.0,
}


@dataclass
class ForexCostConfig:
    """Stores Forex cost and swap configuration properties (§23)."""

    base_spread_pips: Dict[str, float] = field(default_factory=lambda: BASE_SPREADS_PIPS.copy())
    session_multipliers: Dict[str, float] = field(default_factory=lambda: SESSION_SPREAD_MULTIPLIERS.copy())
    wednesday_triple_swap: bool = True
    swap_points_long: float = -0.5
    swap_points_short: float = -0.2


def calculate_forex_trade_cost(
    pair: str,
    entry_time: pd.Timestamp,
    exit_time: pd.Timestamp,
    direction: str = "long",
    session: str = "overlap",
    config: Optional[ForexCostConfig] = None,
) -> Dict[str, float]:
    """Calculates variable spread and swap financing costs for a Forex trade (§23 Item 3).

    Args:
        pair (str): Forex pair symbol (e.g. 'EURUSD').
        entry_time (pd.Timestamp): Entry timestamp.
        exit_time (pd.Timestamp): Exit timestamp.
        direction (str): Trade direction ('long' or 'short').
        session (str): Session identifier.
        config (Optional[ForexCostConfig]): Cost config override.

    Returns:
        Dict[str, float]: Cost summary dictionary (spread_cost_pct, swap_cost_pct, total_cost_pct).
    """
    cfg = config or ForexCostConfig()
    clean_pair = pair.replace("/", "").upper()
    pip_size = PIP_VALUES.get(clean_pair, 0.0001)

    base_spread = cfg.base_spread_pips.get(clean_pair, 1.5)
    mult = cfg.session_multipliers.get(session.lower(), 1.5)
    effective_spread_pips = base_spread * mult

    spread_cost_pct = (effective_spread_pips * pip_size)

    # Swap financing calculation for overnight holds
    days_held = (exit_time - entry_time).days if exit_time > entry_time else 0
    swap_cost_pct = 0.0

    if days_held > 0:
        # Check if Wednesday rollover occurs during holding period
        wednesdays = sum(1 for d in pd.date_range(entry_time, exit_time) if d.dayofweek == 2)
        extra_days = (wednesdays * 2) if cfg.wednesday_triple_swap else 0
        total_swap_days = days_held + extra_days

        rate_pts = cfg.swap_points_long if direction.lower() == "long" else cfg.swap_points_short
        swap_cost_pct = abs(rate_pts * pip_size * total_swap_days)

    total_cost_pct = spread_cost_pct + swap_cost_pct

    return {
        "effective_spread_pips": round(effective_spread_pips, 2),
        "spread_cost_pct": round(spread_cost_pct, 6),
        "swap_cost_pct": round(swap_cost_pct, 6),
        "total_cost_pct": round(total_cost_pct, 6),
    }
