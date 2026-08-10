"""
Monitoring & Edge-Decay Detection Access API Layer.

Official contract functions `detect_edge_decay()`, `classify_decay_reason()`,
`check_system_health()`, and `generate_daily_report()` (§C2.5).

Context:
    Layer 12 (Monitoring & Edge-Decay Detection) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from src.monitoring.decay_detector import detect_edge_decay as internal_detect_edge_decay
from src.monitoring.health import check_system_health as internal_check_system_health
from src.monitoring.regime_classifier import classify_decay_reason as internal_classify_decay_reason
from src.monitoring.reports import generate_daily_report as internal_generate_daily_report

logger = logging.getLogger(__name__)


def detect_edge_decay(
    strategy: str,
    live_returns_r: pd.Series,
    backtest_mean_r: float = 0.40,
    backtest_std_r: float = 1.20,
    window: int = 30,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Calculates rolling z-score drift and returns decay multiplier and action (§C2.5)."""
    return internal_detect_edge_decay(
        strategy=strategy,
        live_returns_r=live_returns_r,
        backtest_mean_r=backtest_mean_r,
        backtest_std_r=backtest_std_r,
        window=window,
        db_path=db_path,
    )


def classify_decay_reason(
    strategy: str,
    live_trades_df: pd.DataFrame,
    favored_regime: str = "up",
    regime_col: str = "trend_regime",
    min_regime_trades: int = 15,
) -> Dict[str, Any]:
    """Classifies performance degradation into REGIME_ABSENT vs EDGE_DEATH (§C2.5)."""
    return internal_classify_decay_reason(
        strategy=strategy,
        live_trades_df=live_trades_df,
        favored_regime=favored_regime,
        regime_col=regime_col,
        min_regime_trades=min_regime_trades,
    )


def check_system_health(
    last_candle_timestamp: Optional[pd.Timestamp] = None,
    max_allowed_lag_minutes: float = 60.0,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Audits system health, data freshness, and job logs (§C2.5)."""
    return internal_check_system_health(
        last_candle_timestamp=last_candle_timestamp,
        max_allowed_lag_minutes=max_allowed_lag_minutes,
        db_path=db_path,
    )


def generate_daily_report(db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Generates Daily System Operating Report (§C2.5)."""
    return internal_generate_daily_report(db_path=db_path)
