"""
Circuit Breakers & Hard Limits Module.

Enforces system-wide risk limits (-1.5% daily loss limit, -3% weekly loss limit, -15% strategy drawdown, -12% portfolio drawdown)
and logs breaker events to DuckDB as mandated by Master Plan §17.3 & §21.

Circuit Breakers (§17.3):
    - daily_loss_limit: -1.5% -> daily lockout armed
    - weekly_loss_limit: -3.0% -> weekly lockout armed
    - strategy_dd_limit: -15.0% -> strategy benched (decay_mult = 0.0)
    - portfolio_dd_limit: -12.0% -> position sizes halved

Context:
    Layer 9 (Risk Engine) circuit breakers specified in Master Plan §17.3 & §21.
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


def log_breaker_event(
    kind: str,
    detail: str,
    db_path: Optional[Path] = None,
) -> int:
    """Logs a circuit breaker event to DuckDB breaker_events table (§21).

    Args:
        kind (str): Breaker kind ('daily_loss', 'weekly_loss', 'strategy_dd', 'portfolio_dd', 'lockout').
        detail (str): Detailed text description.
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
        INSERT INTO breaker_events (event_id, ts, kind, detail, resolved_at)
        VALUES (?, CURRENT_TIMESTAMP, ?, ?, NULL)
        """,
        [event_id, kind, detail],
    )
    con.close()
    logger.warning("Circuit Breaker Event Logged [%s]: %s (event_id=%d)", kind, detail, event_id)
    return event_id


def check_circuit_breakers(
    daily_pnl_pct: float,
    weekly_pnl_pct: float,
    strategy_dd_pct: float = 0.0,
    portfolio_dd_pct: float = 0.0,
    strategy: str = "default_strat",
    db_path: Optional[Path] = None,
    daily_limit: float = -0.015,
    weekly_limit: float = -0.030,
    strat_dd_limit: float = 0.15,
    port_dd_limit: float = 0.12,
) -> Dict[str, Any]:
    """Checks all Master Plan §17.3 circuit breakers and returns system lock/size flags.

    Args:
        daily_pnl_pct (float): Current daily portfolio return (e.g. -0.02 for -2%).
        weekly_pnl_pct (float): Current weekly portfolio return.
        strategy_dd_pct (float): Strategy drawdown from peak. Defaults to 0.0.
        portfolio_dd_pct (float): Portfolio drawdown from peak. Defaults to 0.0.
        strategy (str): Strategy identifier string.
        db_path (Optional[Path]): DuckDB database path override.
        daily_limit (float): Daily loss limit. Defaults to -0.015 (-1.5%).
        weekly_limit (float): Weekly loss limit. Defaults to -0.030 (-3.0%).
        strat_dd_limit (float): Strategy DD limit. Defaults to 0.15 (15%).
        port_dd_limit (float): Portfolio DD limit. Defaults to 0.12 (12%).

    Returns:
        Dict[str, Any]: Circuit breaker evaluation status dictionary.
    """
    lockout = False
    bench_strategy = False
    size_multiplier = 1.0
    triggered_breakers = []

    # 1. Daily Loss Limit (-1.5%)
    if daily_pnl_pct <= daily_limit:
        lockout = True
        triggered_breakers.append("daily_loss")
        log_breaker_event("daily_loss", f"Daily loss {daily_pnl_pct*100:.2f}% breached limit {daily_limit*100:.2f}%", db_path=db_path)

    # 2. Weekly Loss Limit (-3.0%)
    if weekly_pnl_pct <= weekly_limit:
        lockout = True
        triggered_breakers.append("weekly_loss")
        log_breaker_event("weekly_loss", f"Weekly loss {weekly_pnl_pct*100:.2f}% breached limit {weekly_limit*100:.2f}%", db_path=db_path)

    # 3. Strategy Drawdown Limit (15%)
    if strategy_dd_pct >= strat_dd_limit:
        bench_strategy = True
        triggered_breakers.append("strategy_dd")
        log_breaker_event("strategy_dd", f"Strategy {strategy} DD {strategy_dd_pct*100:.2f}% breached limit {strat_dd_limit*100:.2f}% -> BENCHED", db_path=db_path)

    # 4. Portfolio Drawdown Limit (12%)
    if portfolio_dd_pct >= port_dd_limit:
        size_multiplier = 0.5
        triggered_breakers.append("portfolio_dd")
        log_breaker_event("portfolio_dd", f"Portfolio DD {portfolio_dd_pct*100:.2f}% breached limit {port_dd_limit*100:.2f}% -> Sizes Halved", db_path=db_path)

    status = "OK" if len(triggered_breakers) == 0 else "BREAKER_TRIGGERED"
    return {
        "status": status,
        "lockout": lockout,
        "bench_strategy": bench_strategy,
        "size_multiplier": size_multiplier,
        "triggered_breakers": triggered_breakers,
        "alert_payload": {
            "strategy": strategy,
            "status": status,
            "lockout": lockout,
            "bench_strategy": bench_strategy,
            "reason": ", ".join(triggered_breakers) if triggered_breakers else "No breakers armed",
            "unlock_condition": "00:00 UTC rollover" if lockout else "Manual audit required",
        },
    }
