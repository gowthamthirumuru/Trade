"""Edge Discovery Suite API Router for QUANT EDGE.

Provides endpoints for:
- Edge Explorer (Multi-dimensional slice queries, exact p-values, cumulative R curves, edge cards)
- Condition Analysis (Feature lift ranking, permutation importance, Shapley attribution, combinatorial stack simulator)
- Regime Analysis (Market regime classification matrices, Markov transition probabilities, stationary distributions)
- Pattern Mining (Candlestick & SMC structural pattern scanner, win rates, lift, return distributions, confluence)
- Correlation (Cross-strategy correlation matrix, diversification benefit index, redundancy pruning, Meucci bets)
"""

import json
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel, Field

from src.ui.server.services.edge_engine import EdgeEngine
from src.ui.server.services.condition_engine import ConditionEngine
from src.ui.server.services.regime_engine import RegimeEngine
from src.ui.server.services.pattern_engine import PatternEngine
from src.ui.server.services.correlation_engine import CorrelationEngine

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/edge", tags=["Edge Discovery"])


def get_edge_engine() -> EdgeEngine:
    return EdgeEngine()


def get_condition_engine() -> ConditionEngine:
    return ConditionEngine()


def get_regime_engine() -> RegimeEngine:
    return RegimeEngine()


def get_pattern_engine() -> PatternEngine:
    return PatternEngine()


def get_correlation_engine() -> CorrelationEngine:
    return CorrelationEngine()


# -----------------------------------------------------------------------------
# 1. EDGE EXPLORER ENDPOINTS (100% REAL DUCKDB SLICING)
# -----------------------------------------------------------------------------

class SliceQueryRequest(BaseModel):
    pair: Optional[str] = "XAUUSD"
    session: Optional[str] = "london"
    vol_regime: Optional[str] = "high"
    trend_regime: Optional[str] = "bullish"
    day_of_week: Optional[str] = "Tuesday"
    strategy_name: Optional[str] = "BB Reversion v4"


@router.post("/slice-query")
def query_edge_slice(req: SliceQueryRequest) -> Dict[str, Any]:
    """Executes real multi-dimensional slice query against DuckDB trades and computes exact p-value."""
    engine = get_edge_engine()
    return engine.execute_real_slice_query(filters=req.model_dump())


class SaveEdgeCardRequest(BaseModel):
    strategy: str = "BB Reversion v4"
    pair: str = "XAUUSD"
    filter_dict: Dict[str, Any] = Field(default_factory=dict)


@router.post("/cards/save")
def save_edge_card_endpoint(req: SaveEdgeCardRequest) -> Dict[str, Any]:
    """Persists a new active Edge Card into DuckDB `edge_cards` table."""
    engine = get_edge_engine()
    return engine.save_edge_card(
        strategy=req.strategy,
        filter_dict=req.filter_dict,
        pair=req.pair,
    )


# -----------------------------------------------------------------------------
# 2. CONDITION ANALYSIS ENDPOINTS
# -----------------------------------------------------------------------------

@router.get("/conditions/attribution")
def get_condition_attribution(
    strategy: str = Query("BB Reversion v4"),
    pair: str = Query("XAUUSD"),
) -> Dict[str, Any]:
    """Returns marginal win-rate lift, Shapley value importance, and rolling decay across conditions."""
    engine = get_condition_engine()
    return engine.compute_condition_attribution(strategy=strategy, pair=pair)


class SimulateStackRequest(BaseModel):
    strategy: str = "BB Reversion v4"
    pair: str = "XAUUSD"
    active_condition_ids: List[str] = Field(default_factory=lambda: ["COND-01", "COND-02"])


@router.post("/conditions/simulate-stack")
def simulate_condition_stack_endpoint(req: SimulateStackRequest) -> Dict[str, Any]:
    """Simulates multi-condition intersection stack on real historical candle data."""
    engine = get_condition_engine()
    return engine.simulate_condition_stack(
        strategy=req.strategy,
        pair=req.pair,
        active_condition_ids=req.active_condition_ids,
    )


# -----------------------------------------------------------------------------
# 3. REGIME ANALYSIS ENDPOINTS (100% REAL DUCKDB GROUPING & MARKOV MATRIX)
# -----------------------------------------------------------------------------

@router.get("/regimes/matrix")
def get_regime_matrix(
    strategy: str = Query("BB Reversion v4"),
    pair: str = Query("XAUUSD"),
    timeframe: str = Query("15m"),
) -> Dict[str, Any]:
    """Returns real regime performance breakdown, Markov transition probabilities, and stationary distribution."""
    engine = get_regime_engine()
    return engine.compute_regime_matrix(strategy=strategy, pair=pair, timeframe=timeframe)


# -----------------------------------------------------------------------------
# 4. PATTERN MINING ENDPOINTS (100% REAL PARQUET CANDLE PATTERN EXTRACTION)
# -----------------------------------------------------------------------------

@router.get("/patterns/scan")
def get_pattern_mining_results(
    pair: str = Query("XAUUSD"),
    timeframe: str = Query("15m"),
    category: str = Query("all"),
) -> Dict[str, Any]:
    """Scans and returns discovered candlestick and structural patterns with empirical distributions."""
    engine = get_pattern_engine()
    return engine.scan_candle_patterns(pair=pair, timeframe=timeframe, category=category)


# -----------------------------------------------------------------------------
# 5. CORRELATION SUITE ENDPOINTS (100% REAL CROSS-STRATEGY DIVERSIFICATION)
# -----------------------------------------------------------------------------

@router.get("/correlations")
def get_correlation_matrix(
    pair: str = Query("XAUUSD"),
    metric: str = Query("pearson"),
    granularity: str = Query("daily"),
) -> Dict[str, Any]:
    """Returns cross-strategy correlation matrix, Choueifaty DR, Meucci bets, and redundancy alerts."""
    engine = get_correlation_engine()
    return engine.compute_correlation_suite(pair=pair, metric=metric, granularity=granularity)
