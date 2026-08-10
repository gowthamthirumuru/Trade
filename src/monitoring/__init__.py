"""
Layer 12 Monitoring, Alerts & Edge-Decay Detection Module.

Rolling expectancy z-score edge-decay detector, regime-absence vs edge-death classifier,
system health & data freshness monitor, and automated report generators.
"""

from src.monitoring.api import check_system_health, classify_decay_reason, detect_edge_decay, generate_daily_report
from src.monitoring.reports import generate_monthly_report, generate_weekly_report

__all__ = [
    "detect_edge_decay",
    "classify_decay_reason",
    "check_system_health",
    "generate_daily_report",
    "generate_weekly_report",
    "generate_monthly_report",
]
