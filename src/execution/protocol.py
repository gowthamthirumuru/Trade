"""
Pre-Trade Protocol & Violation Tracker Module.

Enforces the Mandatory 5-Point Pre-Trade Checklist and No-Card-No-Trade Law as mandated by Master Plan §19.2.

Protocol Rules (§19.2):
    - A trade without an active Edge Card is a protocol violation.
    - 3 protocol violations in a 7-day window -> 7-day system lockout.

Context:
    Layer 11 (Execution & Live Loop) protocol tracker specified in Master Plan §19.2.
"""

import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional
import duckdb

from src.tradesdb.api import query
from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def validate_pretrade_checklist(
    card_id: Optional[int],
    conditions_verified: bool,
    news_blackout_clear: bool,
    risk_engine_size_ok: bool,
    emotion_score: int,
) -> Dict[str, Any]:
    """Validates mandatory 5-point pre-trade protocol checklist (§19.2).

    Args:
        card_id (Optional[int]): Active Edge Card ID (None if un-carded).
        conditions_verified (bool): Verification flag for setup conditions.
        news_blackout_clear (bool): Macro news blackout clear flag.
        risk_engine_size_ok (bool): Risk Engine size compliance flag.
        emotion_score (int): Emotion score (1..5).

    Returns:
        Dict[str, Any]: Protocol checklist validation dictionary.
    """
    reasons = []

    if card_id is None:
        reasons.append("UN_CARDED_TRADE_VIOLATION")
    if not conditions_verified:
        reasons.append("CONDITIONS_UNVERIFIED")
    if not news_blackout_clear:
        reasons.append("NEWS_BLACKOUT_ACTIVE")
    if not risk_engine_size_ok:
        reasons.append("RISK_SIZE_NON_COMPLIANT")
    if not (1 <= emotion_score <= 5):
        reasons.append("INVALID_EMOTION_SCORE")

    passed = len(reasons) == 0
    status = "CHECKLIST_PASSED" if passed else "CHECKLIST_REJECTED"

    logger.info("Pre-trade checklist validation: status=%s, reasons=%s", status, reasons)
    return {
        "passed": passed,
        "status": status,
        "reasons": reasons,
        "card_id": card_id,
        "emotion_score": emotion_score,
    }


def record_trade_violation(
    trade_id: int,
    reason: str = "UN_CARDED_TRADE",
    db_path: Optional[Path] = None,
) -> int:
    """Records a protocol violation in DuckDB breaker_events table (§19.2).

    Args:
        trade_id (int): Trade ID associated with protocol violation.
        reason (str): Violation reason code. Defaults to 'UN_CARDED_TRADE'.
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
        VALUES (?, CURRENT_TIMESTAMP, 'protocol_violation', ?, NULL)
        """,
        [event_id, f"Trade #{trade_id} violation: {reason}"],
    )
    con.close()
    logger.warning("Recorded protocol violation for trade #%d: %s (event_id=%d)", trade_id, reason, event_id)
    return event_id


def check_protocol_lockout(db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Checks if 3 protocol violations occurred in the last 7 days (§19.2).

    Args:
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Protocol lockout status dictionary.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    try:
        df_violations = query(
            "SELECT event_id FROM breaker_events WHERE kind = 'protocol_violation' AND ts >= CURRENT_TIMESTAMP - INTERVAL 7 DAY",
            db_path=target_db,
        )
        violation_count = len(df_violations)
    except Exception:
        violation_count = 0

    lockout = violation_count >= 3
    logger.info("Protocol lockout check: violations_7d=%d, lockout=%s", violation_count, lockout)
    return {
        "lockout": lockout,
        "violation_count_7d": violation_count,
        "max_allowed": 3,
        "status": "PROTOCOL_LOCKOUT_ARMED" if lockout else "PROTOCOL_OK",
    }
