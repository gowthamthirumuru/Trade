"""
Risk Engine Access API Layer.

Official contract functions `calculate_position_size()`, `check_circuit_breakers()`, `calculate_var_cvar()`,
and `forecast_garch_volatility()` used by downstream modules and UI command center (§C2.5).

Context:
    Layer 9 (Risk Engine) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from src.risk.circuit_breakers import check_circuit_breakers as internal_check_circuit_breakers
from src.risk.metrics import calculate_var_cvar as internal_calculate_var_cvar
from src.risk.metrics import forecast_garch_volatility as internal_forecast_garch_volatility
from src.risk.sizing import calculate_position_size as internal_calculate_position_size

logger = logging.getLogger(__name__)


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
    """Calculates trade position size, risk amount, and token quantity (§C2.5)."""
    return internal_calculate_position_size(
        equity=equity,
        stop_distance_pct=stop_distance_pct,
        entry_price=entry_price,
        portfolio_weight=portfolio_weight,
        confidence_stage=confidence_stage,
        decay_mult=decay_mult,
        base_risk_pct=base_risk_pct,
        max_position_exposure_pct=max_position_exposure_pct,
        win_rate=win_rate,
        avg_win_r=avg_win_r,
        avg_loss_r=avg_loss_r,
    )


def check_circuit_breakers(
    daily_pnl_pct: float,
    weekly_pnl_pct: float,
    strategy_dd_pct: float = 0.0,
    portfolio_dd_pct: float = 0.0,
    strategy: str = "default_strat",
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Checks all Master Plan §17.3 circuit breakers and returns system lock/size flags (§C2.5)."""
    return internal_check_circuit_breakers(
        daily_pnl_pct=daily_pnl_pct,
        weekly_pnl_pct=weekly_pnl_pct,
        strategy_dd_pct=strategy_dd_pct,
        portfolio_dd_pct=portfolio_dd_pct,
        strategy=strategy,
        db_path=db_path,
    )


def calculate_var_cvar(
    returns_series: pd.Series,
    alpha_95: float = 0.05,
    alpha_99: float = 0.01,
) -> Dict[str, float]:
    """Calculates historical Value-at-Risk (VaR) and Conditional VaR (CVaR) (§C2.5)."""
    return internal_calculate_var_cvar(returns_series, alpha_95=alpha_95, alpha_99=alpha_99)


def forecast_garch_volatility(
    returns_series: pd.Series,
    annualization_factor: float = 365.0,
) -> Dict[str, Any]:
    """Forecasts 1-step ahead portfolio volatility using GARCH(1,1) model (§C2.5)."""
    return internal_forecast_garch_volatility(returns_series, annualization_factor=annualization_factor)
