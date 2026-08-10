"""
Unit Test Suite for Telegram Interactive Alert Bot.

Tests inline alert message formatting, callback data handling, and kill-switch trigger callbacks.
"""

from pathlib import Path
import tempfile

import pytest

from src.execution.telegram_bot import handle_telegram_callback, send_interactive_telegram_alert


def test_send_interactive_telegram_alert():
    """Verifies simulated interactive alert payload and keyboard structure."""
    res = send_interactive_telegram_alert({"card_id": 777, "strategy": "mean_reversion_rsi", "pair": "ETHUSDT"})

    assert res["status"] in ["SIMULATED", "DELIVERED"]
    assert res["card_id"] == 777
    assert "reply_markup" in res
    assert len(res["reply_markup"]["inline_keyboard"]) == 2


def test_handle_telegram_callback():
    """Verifies callback processing for execute, reject, and kill-switch commands."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_tg_test.duckdb"

        res_exec = handle_telegram_callback("exec_777", db_path=tmp_db)
        assert res_exec["action"] == "EXECUTE"
        assert res_exec["card_id"] == "777"

        res_reject = handle_telegram_callback("reject_777", db_path=tmp_db)
        assert res_reject["action"] == "REJECT"

        res_kill = handle_telegram_callback("kill_switch_trigger", db_path=tmp_db)
        assert res_kill["action"] == "KILL_SWITCH"
        assert res_kill["result"]["status"] == "KILL_SWITCH_EXECUTED"
