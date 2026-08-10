"""
Unit Test Suite for Project APEX Autonomous Scheduler Engine.

Validates all 6 production scheduler jobs, diagnostic execution modes,
and Telegram digest dispatch as specified in Master Plan §27.1–§27.3.
"""

from pathlib import Path
import sys
import pytest

PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from scripts.scheduler import (
    job_autonomous_mining,
    job_edge_decay_scan,
    job_feature_materialization,
    job_nightly_ingestion,
    job_telegram_digest,
    job_validation_gauntlet,
    run_all_jobs_now,
)


def test_job_nightly_ingestion():
    """Tests Job 1 Nightly Market Data Ingestion."""
    res = job_nightly_ingestion()
    assert res["status"] == "SUCCESS"
    assert "crypto_pairs" in res
    assert "forex_pairs" in res


def test_job_feature_materialization():
    """Tests Job 2 Feature & Session Materialization."""
    res = job_feature_materialization()
    assert res["status"] == "SUCCESS"
    assert res["bars_processed"] >= 0


def test_job_autonomous_mining():
    """Tests Job 3 Autonomous Genetic GP & ML Mining."""
    res = job_autonomous_mining()
    assert res["status"] == "SUCCESS"
    assert "gp_miner" in res
    assert "ml_miner" in res


def test_job_validation_gauntlet():
    """Tests Job 4 6-Gate Validation Gauntlet."""
    res = job_validation_gauntlet()
    assert res["status"] == "SUCCESS"
    assert "gauntlet" in res


def test_job_edge_decay_scan():
    """Tests Job 5 Rolling Edge Decay Scan."""
    res = job_edge_decay_scan()
    assert res["status"] == "SUCCESS"
    assert "decayed_cards" in res


def test_job_telegram_digest():
    """Tests Job 6 Telegram Executive Digest Dispatch."""
    res = job_telegram_digest()
    assert res["status"] == "SUCCESS"
    assert "alert_sent" in res


def test_run_all_jobs_now():
    """Tests complete one-shot execution of all 6 production scheduler jobs."""
    summary = run_all_jobs_now()
    assert "job1_ingestion" in summary
    assert "job6_telegram_digest" in summary
    assert summary["elapsed_sec"] > 0
