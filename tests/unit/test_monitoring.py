"""
Unit Test Suite for Module 12 — Monitoring, Alerts & Edge-Decay Detection.

Validates Acceptance & Quality Inspection Checklist items for Module 12:
    - A12.1 Decay detector catches synthetic decay: degraded stream (-0.3R/trade) -> warning < 30 trades, bench < 50.
    - A12.2 Regime-absence vs edge-death classification.
    - A12.3 Automated reports (daily, weekly, monthly) generate correctly.
    - A12.4 Health monitor flags stale data (> 60 min lag).
    - A12.5 Every bench/warning decay event logged to DuckDB decay_events with timestamp and reason.
"""

from pathlib import Path
import tempfile

import duckdb
import numpy as np
import pandas as pd
import pytest

from src.monitoring.api import check_system_health, classify_decay_reason, detect_edge_decay, generate_daily_report
from src.monitoring.reports import generate_monthly_report, generate_weekly_report
from src.tradesdb.schema import initialize_duckdb_schema


def test_a12_1_decay_detector_catches_synthetic_decay():
    """A12.1 Acceptance Test: Degraded live stream (-0.3R/trade) -> warning < 30 trades, bench < 50."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_decay_test.duckdb"
        initialize_duckdb_schema(db_path=tmp_db)

        # Baseline expected backtest: mean=0.40R, std=1.20R
        # Synthetic degraded live stream: mean = -0.30R
        rng = np.random.default_rng(42)

        # 1. Test 25 degraded trades -> triggers warning (z < -1.5)
        degraded_25 = pd.Series(rng.normal(-0.30, 1.20, 25))
        res_25 = detect_edge_decay("strat_decay_test", degraded_25, backtest_mean_r=0.40, backtest_std_r=1.20, db_path=tmp_db)
        assert res_25["z_score"] < -1.5
        assert res_25["action"] in ["WARNING", "HALF_SIZE", "BENCHED"]

        # 2. Test 45 degraded trades -> triggers BENCHED (z < -2.5)
        degraded_45 = pd.Series(rng.normal(-0.30, 1.20, 45))
        res_45 = detect_edge_decay("strat_decay_test", degraded_45, backtest_mean_r=0.40, backtest_std_r=1.20, db_path=tmp_db)
        assert res_45["z_score"] < -2.5
        assert res_45["action"] == "BENCHED"
        assert res_45["decay_mult"] == 0.0


def test_a12_2_regime_absence_vs_edge_death_classification():
    """A12.2 Acceptance Test: Regime-absence vs edge-death classification."""
    # Case 1: Favored regime 'up' is absent (only 5 trades in 'up' regime)
    trades_absent = pd.DataFrame([
        {"trend_regime": "range", "pnl_r": -0.2} for _ in range(30)
    ] + [
        {"trend_regime": "up", "pnl_r": 0.5} for _ in range(5)
    ])

    res_absent = classify_decay_reason("strat_momo", trades_absent, favored_regime="up")
    assert res_absent["classification"] == "REGIME_ABSENT"
    assert res_absent["action"] == "WAIT"

    # Case 2: True Edge Death (20 trades in favored regime 'up', but negative expectancy -0.4R)
    trades_dead = pd.DataFrame([
        {"trend_regime": "up", "pnl_r": -0.4} for _ in range(20)
    ])

    res_dead = classify_decay_reason("strat_momo", trades_dead, favored_regime="up")
    assert res_dead["classification"] == "EDGE_DEATH"
    assert res_dead["action"] == "BENCH_STRATEGY"


def test_a12_3_automated_report_generation():
    """A12.3 Acceptance Test: All three reports (daily, weekly, monthly) generate correctly."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_rep_test.duckdb"
        initialize_duckdb_schema(db_path=tmp_db)

        rep_daily = generate_daily_report(db_path=tmp_db)
        rep_weekly = generate_weekly_report(db_path=tmp_db)
        rep_monthly = generate_monthly_report(db_path=tmp_db)

        assert rep_daily["type"] == "daily"
        assert "Daily Operating Report" in rep_daily["text"]

        assert rep_weekly["type"] == "weekly"
        assert "Weekly Strategy Performance" in rep_weekly["text"]

        assert rep_monthly["type"] == "monthly"
        assert "Monthly Re-validation" in rep_monthly["text"]


def test_a12_4_health_monitor_detects_stale_data():
    """A12.4 Acceptance Test: Health monitor flags stale data (> 60 min lag)."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_health_test.duckdb"
        initialize_duckdb_schema(db_path=tmp_db)

        # Fresh data timestamp (10 min ago)
        fresh_ts = pd.Timestamp.now(tz="UTC") - pd.Timedelta(minutes=10)
        res_fresh = check_system_health(last_candle_timestamp=fresh_ts, max_allowed_lag_minutes=60.0, db_path=tmp_db)
        assert res_fresh["status"] == "HEALTHY"
        assert res_fresh["stale_data"] == False

        # Stale data timestamp (120 min ago)
        stale_ts = pd.Timestamp.now(tz="UTC") - pd.Timedelta(minutes=120)
        res_stale = check_system_health(last_candle_timestamp=stale_ts, max_allowed_lag_minutes=60.0, db_path=tmp_db)
        assert res_stale["status"] == "STALE_DATA"
        assert res_stale["stale_data"] == True


def test_a12_5_decay_events_logged_to_duckdb():
    """A12.5 Acceptance Test: Every bench/warning event writes to DuckDB decay_events with timestamp & reason."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_decay_db.duckdb"
        initialize_duckdb_schema(db_path=tmp_db)

        rng = np.random.default_rng(42)
        degraded = pd.Series(rng.normal(-0.50, 1.0, 40))

        res = detect_edge_decay("strat_decay_log_test", degraded, backtest_mean_r=0.40, backtest_std_r=1.20, db_path=tmp_db)
        assert res["action"] == "BENCHED"

        con = duckdb.connect(str(tmp_db))
        rows = con.execute("SELECT strategy, z_score, action, note FROM decay_events ORDER BY event_id").fetchall()
        con.close()

        assert len(rows) >= 1
        assert rows[-1][0] == "strat_decay_log_test"
        assert rows[-1][2] == "BENCHED"
