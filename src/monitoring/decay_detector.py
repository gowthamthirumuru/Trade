"""
Edge-Decay Detector Module.

Tracks live vs historical strategy expectancy drift, calculates rolling z-scores,
and logs decay events to DuckDB as mandated by Master Plan §20.2 & §21.

Decay Action Thresholds (§20.2):
    - z < -1.5 -> WARNING (decay_mult = 1.0)
    - z < -2.0 -> HALF_SIZE (decay_mult = 0.5)
    - z < -2.5 -> BENCHED (decay_mult = 0.0)

Context:
    Layer 12 (Monitoring & Edge-Decay Detection) specified in Master Plan §20.2 & §21.
"""

import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional
import duckdb
import numpy as np
import pandas as pd

from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def log_decay_event(
    strategy: str,
    z_score: float,
    action: str,
    note: str,
    db_path: Optional[Path] = None,
) -> int:
    """Logs an edge decay event to DuckDB decay_events table (§21).

    Args:
        strategy (str): Strategy identifier.
        z_score (float): Calculated expectancy drift z-score.
        action (str): Action code ('WARNING', 'HALF_SIZE', 'BENCHED').
        note (str): Detailed text note.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        int: Generated event_id integer.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    event_id = int(time.time() * 1000)
    con = duckdb.connect(str(target_db))
    con.execute(
        """
        INSERT INTO decay_events (event_id, ts, strategy, z_score, action, note)
        VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
        """,
        [event_id, strategy, float(z_score), action, note],
    )
    con.close()
    logger.warning("Edge Decay Event Logged [%s] Strategy=%s, z=%.2f: %s (event_id=%d)", action, strategy, z_score, note, event_id)
    return event_id


def detect_edge_decay(
    strategy: str,
    live_returns_r: pd.Series,
    backtest_mean_r: float = 0.40,
    backtest_std_r: float = 1.20,
    window: int = 30,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Calculates rolling z-score drift and returns decay multiplier and action (§20.2).

    Args:
        strategy (str): Strategy identifier string.
        live_returns_r (pd.Series): Trailing series of live trade returns in R.
        backtest_mean_r (float): Historical backtest mean return in R. Defaults to 0.40.
        backtest_std_r (float): Historical backtest return std in R. Defaults to 1.20.
        window (int): Trailing trade window size. Defaults to 30.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Edge decay evaluation dictionary.
    """
    if live_returns_r.empty or len(live_returns_r) < 5:
        return {
            "strategy": strategy,
            "z_score": 0.0,
            "decay_mult": 1.0,
            "action": "OK",
            "n_trades": len(live_returns_r),
            "status": "INSUFFICIENT_DATA",
        }

    sample = live_returns_r.iloc[-window:].values
    N = len(sample)
    live_mean = float(np.mean(sample))

    # Standard error of the mean under backtest std
    se = max(backtest_std_r / np.sqrt(N), 1e-4)
    z_score = float((live_mean - backtest_mean_r) / se)

    action = "OK"
    decay_mult = 1.0

    if z_score < -2.5:
        action = "BENCHED"
        decay_mult = 0.0
        log_decay_event(strategy, z_score, action, f"Severe decay z={z_score:.2f} < -2.5 -> Strategy Benched", db_path=db_path)
    elif z_score < -2.0:
        action = "HALF_SIZE"
        decay_mult = 0.5
        log_decay_event(strategy, z_score, action, f"Moderate decay z={z_score:.2f} < -2.0 -> Sizes Halved", db_path=db_path)
    elif z_score < -1.5:
        action = "WARNING"
        decay_mult = 1.0
        log_decay_event(strategy, z_score, action, f"Minor decay warning z={z_score:.2f} < -1.5", db_path=db_path)

    logger.info("Decay Detector [%s]: strategy=%s, z=%.2f, live_mean=%.2fR, decay_mult=%.1f", action, strategy, z_score, live_mean, decay_mult)
    return {
        "strategy": strategy,
        "z_score": round(z_score, 4),
        "live_mean_r": round(live_mean, 4),
        "decay_mult": decay_mult,
        "action": action,
        "n_trades": N,
        "status": "EVALUATED",
    }
