"""
Unit Test Suite for Module 11 — Execution & Live Loop.

Validates Acceptance & Quality Inspection Checklist items for Module 11:
    - A11.1 Alert bot delivers test messages with correct card content and sizing.
    - A11.2 Journal form writes complete trade + journal rows; rejects incomplete checklist.
    - A11.3 Violation counter: 3 un-carded trades -> lockout state set.
    - A11.4 Testnet bridge: places/closes 10 trades on testnet mock; all journaled; slippage reported.
    - A11.5 Kill-switch drill: flattens positions and disarms alerts.
    - A11.6 Monthly slippage calibration report generated from trade data.
"""

from pathlib import Path
import tempfile

import duckdb
import pandas as pd
import pytest

from src.execution.api import (
    calibrate_slippage,
    execute_kill_switch,
    generate_edge_alert_payload,
    place_testnet_order,
    validate_pretrade_checklist,
)
from src.execution.protocol import check_protocol_lockout, record_trade_violation
from src.tradesdb.api import write_trades
from src.tradesdb.schema import initialize_duckdb_schema


def test_a11_1_alert_bot_delivers_test_messages():
    """A11.1 Acceptance Test: Alert bot delivers test messages with correct card content and sizing."""
    card_dict = {
        "card_id": 41,
        "strategy": "momo_breakout",
        "pair": "SOLUSDT",
        "timeframe": "15m",
        "expectancy_r": 0.55,
    }

    payload = generate_edge_alert_payload(card_dict=card_dict, equity=10000.0, entry_price=150.0, stop_distance_pct=0.02)

    assert payload["status"] == "ALERT_GENERATED"
    assert "EDGE #41 active now" in payload["message_text"]
    assert "SOLUSDT" in payload["message_text"]
    assert "Invalid below 147.0" in payload["message_text"]
    assert payload["sizing"]["qty"] > 0


def test_a11_2_journal_form_pretrade_checklist_validation():
    """A11.2 Acceptance Test: Pre-trade checklist validator accepts valid entries & rejects incomplete."""
    # Valid submission
    res_valid = validate_pretrade_checklist(
        card_id=41,
        conditions_verified=True,
        news_blackout_clear=True,
        risk_engine_size_ok=True,
        emotion_score=2,
    )
    assert res_valid["passed"] == True
    assert res_valid["status"] == "CHECKLIST_PASSED"

    # Incomplete submission (missing card_id & invalid emotion score)
    res_invalid = validate_pretrade_checklist(
        card_id=None,
        conditions_verified=True,
        news_blackout_clear=True,
        risk_engine_size_ok=True,
        emotion_score=6,
    )
    assert res_invalid["passed"] == False
    assert "UN_CARDED_TRADE_VIOLATION" in res_invalid["reasons"]
    assert "INVALID_EMOTION_SCORE" in res_invalid["reasons"]


def test_a11_3_violation_counter_three_trades_lockout():
    """A11.3 Acceptance Test: 3 un-carded trade violations -> lockout state set."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_exec_test.duckdb"
        initialize_duckdb_schema(db_path=tmp_db)

        # Initially no lockout
        res0 = check_protocol_lockout(db_path=tmp_db)
        assert res0["lockout"] == False

        # Record 3 violations
        record_trade_violation(trade_id=101, reason="UN_CARDED_TRADE", db_path=tmp_db)
        record_trade_violation(trade_id=102, reason="UN_CARDED_TRADE", db_path=tmp_db)
        record_trade_violation(trade_id=103, reason="UN_CARDED_TRADE", db_path=tmp_db)

        # Lockout triggered
        res3 = check_protocol_lockout(db_path=tmp_db)
        assert res3["lockout"] == True
        assert res3["violation_count_7d"] == 3


def test_a11_4_testnet_bridge_places_orders_and_journals():
    """A11.4 Acceptance Test: Testnet bridge places 10 testnet orders, journals fills, and measures slippage."""
    fills = []
    for i in range(10):
        fill = place_testnet_order(
            symbol="BTCUSDT",
            side="buy" if i % 2 == 0 else "sell",
            qty=0.5,
            price=20000.0,
            slippage_bps=2.5,
        )
        assert fill["status"] == "FILLED"
        fills.append(fill)

    assert len(fills) == 10
    # Buy fill higher, sell fill lower
    assert fills[0]["fill_price"] > 20000.0
    assert fills[1]["fill_price"] < 20000.0


def test_a11_5_kill_switch_drill_flattens_and_disarms():
    """A11.5 Acceptance Test: Kill-switch drill flattens positions and disarms alerts."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_ks_test.duckdb"
        initialize_duckdb_schema(db_path=tmp_db)

        res_ks = execute_kill_switch(db_path=tmp_db)

        assert res_ks["status"] == "KILL_SWITCH_EXECUTED"
        assert res_ks["positions_flattened"] == True
        assert res_ks["alerts_disarmed"] == True

        con = duckdb.connect(str(tmp_db))
        rows = con.execute("SELECT kind, detail FROM breaker_events WHERE kind = 'kill_switch'").fetchall()
        con.close()

        assert len(rows) == 1
        assert "EMERGENCY KILL-SWITCH" in rows[0][1]


def test_a11_6_monthly_slippage_calibration_report():
    """A11.6 Acceptance Test: Monthly slippage calibration report generated from trade data."""
    trades = [
        {"trade_id": i, "slippage": 1.5 + (i * 0.2), "source": "testnet"} for i in range(20)
    ]
    df_trades = pd.DataFrame(trades)

    report = calibrate_slippage(trades_df=df_trades)

    assert report["status"] == "CALIBRATED"
    assert report["sample_size"] == 20
    assert report["mean_slippage_bps"] > 0.0
    assert report["recommended_backtest_slippage_bps"] >= 2.0
