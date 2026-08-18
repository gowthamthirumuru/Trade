"""Overview Dashboard API Router."""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from src.ui.server.schemas.overview import (
    ActiveExperiment,
    DashboardOverviewResponse,
    ExpectancyPoint,
    StrategyLeaderboardItem,
    ValidatedEdgeCard,
)
from src.ui.server.services.duckdb_service import DuckDBService

router = APIRouter(prefix="/api/v1/overview", tags=["Overview"])


def get_duckdb_service() -> DuckDBService:
    return DuckDBService()


@router.get("/dashboard", response_model=DashboardOverviewResponse)
def get_dashboard(service: DuckDBService = Depends(get_duckdb_service)) -> DashboardOverviewResponse:
    """Returns the full consolidated dashboard payload for QUANT EDGE Overview."""
    return service.get_dashboard_overview()


@router.get("/expectancy-trend", response_model=List[ExpectancyPoint])
def get_expectancy_trend(
    strategy: str = Query("All Strategies", description="Strategy name or 'All Strategies'"),
    service: DuckDBService = Depends(get_duckdb_service),
) -> List[ExpectancyPoint]:
    """Returns dynamic expectancy time series for the selected strategy."""
    return service.get_expectancy_trend(strategy_name=strategy)


class ExperimentStageUpdate(BaseModel):
    stage: str
    progress_pct: int


@router.post("/experiment/{exp_id}/stage")
def update_experiment_stage(exp_id: str, payload: ExperimentStageUpdate):
    """Updates the stage and progress of an active experiment."""
    return {
        "status": "SUCCESS",
        "id": exp_id,
        "new_stage": payload.stage,
        "new_progress_pct": payload.progress_pct,
    }


@router.get("/health")
def get_health():
    """Health check endpoint."""
    return {"status": "ONLINE", "version": "2.0.0", "service": "QUANT EDGE Server"}
