"""
Integration Test Suite for End-to-End Factory Pipeline.

Validates end-to-end execution of Project APEX across all 12 Core Architecture Modules (L1-L12)
as mandated by Master Plan Part C-2 (§C2.4) and Appendix E (Master Project Sign-Off Checklist).
"""

from pathlib import Path
import tempfile

import pytest

from scripts.run_pipeline import execute_apex_pipeline


def test_end_to_end_factory_pipeline_execution():
    """Verifies end-to-end pipeline execution across all 12 modules in temp database."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_e2e_test.duckdb"

        audit = execute_apex_pipeline(db_path=tmp_db, n_synthetic_trades=280)

        assert audit["status"] == "SUCCESS"
        assert audit["total_trades_logged"] > 0
        assert len(audit["active_card_ids"]) == 4
        assert len(audit["strategy_weights"]) == 4
        assert len(audit["sized_positions"]) == 4
        assert audit["breaker_status"] == "OK"
        assert audit["health_status"] == "HEALTHY"
        assert audit["decay_status"] == "EVALUATED"
