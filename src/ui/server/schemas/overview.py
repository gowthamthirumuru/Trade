"""Overview & Dashboard Pydantic Schemas."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class KpiMetric(BaseModel):
    id: str
    title: str
    value: str
    subtext: str
    badge_type: str = "positive"  # positive, neutral, warning, highlight
    sparkline: List[float] = Field(default_factory=list)


class StrategyLeaderboardItem(BaseModel):
    rank: int
    name: str
    expectancy_r: float
    oos_expectancy_r: float
    profit_factor: float
    max_dd_pct: float
    robustness_score: int
    trades_count: int
    sparkline: List[float] = Field(default_factory=list)
    trend: str = "up"  # up, down, flat


class ValidatedEdgeCard(BaseModel):
    id: int
    pair: str
    strategy_name: str
    filters_desc: str
    expectancy_r: float
    trades_count: int
    oos_expectancy_r: float
    profit_factor: float
    confidence_stars: int = 5
    status: str = "VALIDATED"


class ActiveExperiment(BaseModel):
    id: str
    title: str
    strategy: str
    stage: str  # OOS VALIDATION, TESTING, ANALYZING, DESIGN, QUEUED
    progress_pct: int
    status_color: str = "purple"


class ExpectancyPoint(BaseModel):
    date: str
    expectancy: float
    strategy: str = "All"


class RobustnessDistribution(BaseModel):
    total_strategies: int = 24
    average_robustness: int = 68
    high_count: int = 7
    high_pct: float = 29.0
    medium_count: int = 11
    medium_pct: float = 46.0
    low_count: int = 6
    low_pct: float = 25.0


class ResearchWarning(BaseModel):
    id: str
    title: str
    description: str
    severity: str  # High, Medium, Low
    created_at: str = "Recent"


class DataHealthItem(BaseModel):
    instrument: str
    quality_pct: float
    time_range: str
    candles_count: str


class DataHealthSummary(BaseModel):
    overall_quality_pct: int = 98
    items: List[DataHealthItem] = Field(default_factory=list)


class TraderSkill(BaseModel):
    name: str
    score: int
    color: str


class TraderDevelopmentSummary(BaseModel):
    overall_score: int = 82
    skills: List[TraderSkill] = Field(default_factory=list)


class JournalSummary(BaseModel):
    total_trades_logged: int = 48
    rules_broken: int = 7
    rules_broken_pct: float = 14.8
    best_performing_day: str = "Tuesday"
    avg_r_per_trade: float = 0.38
    most_common_mistake: str = "Early Exit"
    review_consistency_pct: int = 78


class RecentActivityItem(BaseModel):
    id: str
    text: str
    time_ago: str
    category: str = "backtest"


class DashboardOverviewResponse(BaseModel):
    kpis: List[KpiMetric]
    strategies: List[StrategyLeaderboardItem]
    validated_edges: List[ValidatedEdgeCard]
    active_experiments: List[ActiveExperiment]
    expectancy_history: List[ExpectancyPoint]
    robustness_distribution: RobustnessDistribution
    warnings: List[ResearchWarning]
    data_health: DataHealthSummary
    trader_development: TraderDevelopmentSummary
    journal_summary: JournalSummary
    recent_activity: List[RecentActivityItem]
