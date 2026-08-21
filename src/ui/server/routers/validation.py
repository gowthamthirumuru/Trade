"""Validation Suite API Router for QUANT EDGE.

Provides endpoints for:
- Walk-Forward (Anchored and rolling WFER efficiency ratios, window visualizer, concatenated OOS curves)
- Out-of-Sample (In-sample vs out-of-sample degradation, parameter stability index, dual equity curves)
- Monte Carlo (Multi-path resampled equity curves, risk of ruin, drawdown distributions)
- Robustness (Parameter perturbation stress testing, slippage sensitivity curves, plateau analyzer)
- Overfitting Detector (Deflated Sharpe Ratio - DSR, Probability of Backtest Overfitting - PBO via CSCV)
"""

import logging
from typing import Any, Dict, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel

from src.ui.server.services.backtest_engine import BacktestEngine
from src.ui.server.services.live_data_engine import LiveDataEngine
from src.ui.server.services.walkforward_engine import WalkForwardEngine
from src.ui.server.services.oos_engine import OOSEngine
from src.ui.server.services.monte_carlo_engine import MonteCarloEngine
from src.ui.server.services.robustness_engine import RobustnessEngine
from src.ui.server.services.overfitting_engine import OverfittingEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/validation", tags=["Validation"])


def get_backtest_engine() -> BacktestEngine:
    return BacktestEngine()


def get_live_engine() -> LiveDataEngine:
    return LiveDataEngine()


def get_walkforward_engine() -> WalkForwardEngine:
    return WalkForwardEngine()


def get_oos_engine() -> OOSEngine:
    return OOSEngine()


def get_monte_carlo_engine() -> MonteCarloEngine:
    return MonteCarloEngine()


def get_robustness_engine() -> RobustnessEngine:
    return RobustnessEngine()


def get_overfitting_engine() -> OverfittingEngine:
    return OverfittingEngine()


# -----------------------------------------------------------------------------
# 1. WALK-FORWARD ANALYSIS ENDPOINTS (100% REAL FROM PARQUET DATA)
# -----------------------------------------------------------------------------

@router.get("/walkforward")
def get_walkforward_analysis(
    strategy: str = Query("BB Reversion v4"),
    pair: str = Query("XAUUSD"),
    timeframe: str = Query("15m"),
    mode: str = Query("rolling"),
    n_windows: int = Query(5),
    train_pct: int = Query(70),
) -> Dict[str, Any]:
    """Returns rolling and anchored walk-forward efficiency analysis calculated on real historical bars."""
    engine = get_walkforward_engine()
    return engine.run_walkforward_suite(
        strategy_name=strategy,
        pair=pair,
        timeframe=timeframe,
        mode=mode,
        n_windows=n_windows,
        train_pct=train_pct,
    )


# -----------------------------------------------------------------------------
# 2. OUT-OF-SAMPLE GAUNTLET ENDPOINTS (100% REAL FROM PARQUET DATA)
# -----------------------------------------------------------------------------

@router.get("/oos-gauntlet")
def get_oos_gauntlet(
    strategy: str = Query("BB Reversion v4"),
    pair: str = Query("XAUUSD"),
    timeframe: str = Query("15m"),
    split_pct: int = Query(70),
    embargo_bars: int = Query(50),
) -> Dict[str, Any]:
    """Returns In-Sample vs Out-of-Sample performance teardown and degradation score."""
    engine = get_oos_engine()
    return engine.run_oos_gauntlet(
        strategy_name=strategy,
        pair=pair,
        timeframe=timeframe,
        split_pct=split_pct,
        embargo_bars=embargo_bars,
    )


# -----------------------------------------------------------------------------
# 3. MONTE CARLO SIMULATION ENDPOINTS (100% REAL BOOTSTRAP RESAMPLING)
# -----------------------------------------------------------------------------

class MonteCarloRunRequest(BaseModel):
    strategy: str = "BB Reversion v4"
    pair: str = "XAUUSD"
    timeframe: str = "15m"
    iterations: int = 5000
    horizon: int = 100
    resample_method: str = "stationary"
    confidence_level: float = 0.95


@router.get("/monte-carlo")
def get_monte_carlo_simulation(
    strategy: str = Query("BB Reversion v4"),
    pair: str = Query("XAUUSD"),
    timeframe: str = Query("15m"),
    iterations: int = Query(5000),
    horizon: int = Query(100),
    resample_method: str = Query("stationary"),
) -> Dict[str, Any]:
    """Generates multi-path resampled equity curves directly from real trades."""
    engine = get_monte_carlo_engine()
    return engine.run_monte_carlo(
        strategy_name=strategy,
        pair=pair,
        timeframe=timeframe,
        iterations=iterations,
        horizon=horizon,
        resample_method=resample_method,
    )


@router.post("/monte-carlo")
def run_monte_carlo_simulation(req: Optional[MonteCarloRunRequest] = None) -> Dict[str, Any]:
    """Generates multi-path resampled equity curves via POST."""
    strategy_name = req.strategy if req else "BB Reversion v4"
    pair = req.pair if req else "XAUUSD"
    timeframe = req.timeframe if req else "15m"
    iterations = req.iterations if req else 5000
    horizon = req.horizon if req else 100
    resample_method = req.resample_method if req else "stationary"

    engine = get_monte_carlo_engine()
    return engine.run_monte_carlo(
        strategy_name=strategy_name,
        pair=pair,
        timeframe=timeframe,
        iterations=iterations,
        horizon=horizon,
        resample_method=resample_method,
    )


# -----------------------------------------------------------------------------
# 4. ROBUSTNESS & PERTURBATION TESTING ENDPOINTS (100% REAL FROM PARQUET DATA)
# -----------------------------------------------------------------------------

@router.get("/robustness-stress")
def get_robustness_stress(
    strategy: str = Query("BB Reversion v4"),
    pair: str = Query("XAUUSD"),
    timeframe: str = Query("15m"),
    perturbation_range: int = Query(30),
) -> Dict[str, Any]:
    """Returns parameter jitter stress test and slippage sensitivity curves calculated on real candles."""
    engine = get_robustness_engine()
    return engine.run_robustness_suite(
        strategy_name=strategy,
        pair=pair,
        timeframe=timeframe,
        perturbation_range=perturbation_range,
    )


# -----------------------------------------------------------------------------
# 5. OVERFITTING DETECTOR (DSR & PBO) ENDPOINTS (100% REAL STATISTICAL INFERENCE)
# -----------------------------------------------------------------------------

@router.get("/overfitting-detector")
def get_overfitting_analysis(
    strategy: str = Query("BB Reversion v4"),
    pair: str = Query("XAUUSD"),
    timeframe: str = Query("15m"),
    n_trials: int = Query(184),
    n_blocks: int = Query(16),
) -> Dict[str, Any]:
    """Calculates Deflated Sharpe Ratio (DSR) and Probability of Backtest Overfitting (PBO)."""
    engine = get_overfitting_engine()
    return engine.run_overfitting_suite(
        strategy_name=strategy,
        pair=pair,
        timeframe=timeframe,
        n_trials=n_trials,
        n_blocks=n_blocks,
    )
