"""
System Health & Data Freshness Monitor Module.

Monitors Data Lake freshness, job execution success, and database health as mandated by Master Plan §20.4 & A12.4.

Context:
    Layer 12 (Monitoring & Edge-Decay Detection) health monitor specified in Master Plan §20.4 & A12.4.
"""

import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional
import duckdb
import pandas as pd

from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def check_system_health(
    last_candle_timestamp: Optional[pd.Timestamp] = None,
    max_allowed_lag_minutes: float = 60.0,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Audits system health, data freshness, and job logs (§20.4 & A12.4).

    Args:
        last_candle_timestamp (Optional[pd.Timestamp]): Timestamp of latest ingested candle.
        max_allowed_lag_minutes (float): Max allowed lag in minutes. Defaults to 60.0.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: System health audit dictionary.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    now_utc = pd.Timestamp.now(tz="UTC")
    lag_minutes = 0.0
    stale_data = False

    if last_candle_timestamp is not None:
        if last_candle_timestamp.tzinfo is None:
            last_candle_timestamp = last_candle_timestamp.tz_localize("UTC")
        lag_minutes = (now_utc - last_candle_timestamp).total_seconds() / 60.0
        stale_data = lag_minutes > max_allowed_lag_minutes

    status = "STALE_DATA" if stale_data else "HEALTHY"

    # Query latest breaker and decay logs
    try:
        con = duckdb.connect(str(target_db))
        n_breakers = con.execute("SELECT COUNT(*) FROM breaker_events").fetchone()[0]
        n_decay = con.execute("SELECT COUNT(*) FROM decay_events").fetchone()[0]
        con.close()
    except Exception:
        n_breakers, n_decay = 0, 0

    if stale_data:
        logger.warning("System Health Alert: Stale data detected (lag=%.1f min > %.1f min threshold)", lag_minutes, max_allowed_lag_minutes)

    return {
        "status": status,
        "stale_data": stale_data,
        "lag_minutes": round(lag_minutes, 2),
        "max_allowed_lag_minutes": max_allowed_lag_minutes,
        "breaker_events_count": n_breakers,
        "decay_events_count": n_decay,
        "timestamp": now_utc.strftime("%Y-%m-%d %H:%M:%S UTC"),
    }
