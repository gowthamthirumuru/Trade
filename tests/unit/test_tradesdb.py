"""
Unit Test Suite for Module 5 — Trade Database (The Edge Mine).

Validates Acceptance & Quality Inspection Checklist items for Module 5:
    - A5.1 Schema created idempotently via DDL scripts.
    - A5.2 Round-trip test: 50-trade log written -> 50 rows present, labels non-null.
    - A5.3 Label correctness spot-check: session, day, hour, regime labels.
    - A5.4 Idempotency test: re-writing same run adds 0 duplicate rows.
    - A5.5 Backtest / live trade label derivation parity.
    - A5.6 Query performance and public API contract.
    - A5.7 Prebuilt analytical views response (v_strategy_summary, v_hourly, v_session, v_regime).
    - A5.8 Backup & restore verification drill.
"""

from pathlib import Path
import tempfile
import time

import duckdb
import numpy as np
import pandas as pd
import pytest

from src.tradesdb.api import query, write_trades
from src.tradesdb.backup import backup_database, verify_restore
from src.tradesdb.label import derive_edge_labels, session_of_hour
from src.tradesdb.schema import initialize_duckdb_schema
from src.tradesdb.views import (
    get_daily_breakdown,
    get_hourly_breakdown,
    get_regime_breakdown,
    get_session_breakdown,
    get_strategy_summary,
)


@pytest.fixture
def sample_50_trades() -> pd.DataFrame:
    """Generates 50 synthetic trade records for testing."""
    timestamps = pd.date_range("2023-01-01 00:00:00", periods=50, freq="1h", tz="UTC")
    trades = []
    for i in range(50):
        entry_ts = timestamps[i]
        exit_ts = entry_ts + pd.Timedelta(minutes=30)
        entry_p = 100.0 + (i * 0.5)
        exit_p = entry_p + (1.0 if i % 2 == 0 else -0.8)
        pnl_pct = (exit_p - entry_p) / entry_p
        trades.append({
            "trade_id": i + 1,
            "strategy": "strat_alpha",
            "pair": "BTCUSDT",
            "timeframe": "1h",
            "direction": "long",
            "entry_time": entry_ts,
            "exit_time": exit_ts,
            "entry_price": entry_p,
            "exit_price": exit_p,
            "qty": 1.0,
            "pnl_quote": pnl_pct * 1000.0,
            "pnl_pct": pnl_pct,
            "pnl_r": pnl_pct / 0.01,
            "fees": 10.0,
            "slippage": 4.0,
            "mae_pct": -0.5,
            "mfe_pct": 1.2,
            "bars_held": 1,
            "exit_reason": "tp" if i % 2 == 0 else "sl",
            "source": "backtest",
        })
    return pd.DataFrame(trades)


def test_a5_1_schema_creation_idempotency():
    """A5.1 Acceptance Test: Schema initialized idempotently via DDL migration scripts."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"
        initialize_duckdb_schema(db_path=tmp_db)

        con = duckdb.connect(str(tmp_db))
        tables = [r[0] for r in con.execute("SHOW TABLES").fetchall()]
        con.close()

        assert "runs" in tables
        assert "trades" in tables
        assert "edge_cards" in tables
        assert "live_journal" in tables

        # Re-initialize schema to test idempotency
        initialize_duckdb_schema(db_path=tmp_db)
        assert tmp_db.exists()


def test_a5_2_roundtrip_trades_persistence(sample_50_trades: pd.DataFrame):
    """A5.2 Acceptance Test: 50-trade log written -> all 50 rows present, labels non-null."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"
        n_written = write_trades("run_roundtrip_50", sample_50_trades, db_path=tmp_db)
        assert n_written == 50

        con = duckdb.connect(str(tmp_db))
        res = con.execute("SELECT COUNT(*), COUNT(session), COUNT(trend_regime) FROM trades WHERE run_id = 'run_roundtrip_50'").fetchone()
        con.close()

        assert res[0] == 50
        assert res[1] == 50  # session non-null
        assert res[2] == 50  # trend_regime non-null


def test_a5_3_label_correctness_spot_check():
    """A5.3 Acceptance Test: Verify spot correctness of session, hour, and day labels."""
    assert session_of_hour(2) == "asia"
    assert session_of_hour(9) == "europe"
    assert session_of_hour(14) == "overlap"
    assert session_of_hour(18) == "us"
    assert session_of_hour(22) == "off"

    single_trade = pd.DataFrame([{
        "trade_id": 999,
        "entry_time": pd.Timestamp("2023-01-01 14:30:00", tz="UTC"),  # Sunday, 14:00 UTC
        "pair": "BTCUSDT",
    }])
    labeled = derive_edge_labels(single_trade)
    assert labeled.iloc[0]["hour_utc"] == 14
    assert labeled.iloc[0]["day_of_week"] == 6  # Sunday = 6
    assert labeled.iloc[0]["session"] == "overlap"


def test_a5_4_writer_idempotency(sample_50_trades: pd.DataFrame):
    """A5.4 Acceptance Test: Re-writing same run adds 0 duplicate rows."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"
        run_id = "run_idempotency_test"

        n1 = write_trades(run_id, sample_50_trades, db_path=tmp_db)
        assert n1 == 50

        n2 = write_trades(run_id, sample_50_trades, db_path=tmp_db)
        assert n2 == 0

        con = duckdb.connect(str(tmp_db))
        count = con.execute("SELECT COUNT(*) FROM trades WHERE run_id = ?", [run_id]).fetchone()[0]
        con.close()
        assert count == 50


def test_a5_5_backtest_live_label_parity():
    """A5.5 Acceptance Test: Backtest and live trades get identical derived labels at same timestamp."""
    entry_ts = pd.Timestamp("2023-05-15 08:15:00", tz="UTC")

    bt_trade = pd.DataFrame([{"trade_id": 1, "entry_time": entry_ts, "source": "backtest", "pair": "ETHUSDT"}])
    live_trade = pd.DataFrame([{"trade_id": 2, "entry_time": entry_ts, "source": "live", "pair": "ETHUSDT"}])

    lbl_bt = derive_edge_labels(bt_trade).iloc[0]
    lbl_live = derive_edge_labels(live_trade).iloc[0]

    assert lbl_bt["hour_utc"] == lbl_live["hour_utc"] == 8
    assert lbl_bt["day_of_week"] == lbl_live["day_of_week"] == 0  # Monday
    assert lbl_bt["session"] == lbl_live["session"] == "europe"


def test_a5_6_query_performance_and_api(sample_50_trades: pd.DataFrame):
    """A5.6 Acceptance Test: Public query() contract function returns < 3 seconds."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"
        write_trades("run_perf_test", sample_50_trades, db_path=tmp_db)

        t0 = time.time()
        res_df = query("SELECT COUNT(*), AVG(pnl_r) FROM trades WHERE run_id = ?", {"1": "run_perf_test"}, db_path=tmp_db)
        elapsed = time.time() - t0

        assert elapsed < 3.0
        assert not res_df.empty


def test_a5_7_analytical_views_response(sample_50_trades: pd.DataFrame):
    """A5.7 Acceptance Test: Analytical views v_strategy_summary, v_hourly, v_session respond correctly."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"
        write_trades("run_views_test", sample_50_trades, db_path=tmp_db)

        df_strat = get_strategy_summary(db_path=tmp_db)
        df_hour = get_hourly_breakdown(db_path=tmp_db)
        df_sess = get_session_breakdown(db_path=tmp_db)
        df_reg = get_regime_breakdown(db_path=tmp_db)

        assert not df_strat.empty
        assert not df_hour.empty
        assert not df_sess.empty
        assert not df_reg.empty


def test_a5_8_backup_and_restore_verification(sample_50_trades: pd.DataFrame):
    """A5.8 Acceptance Test: Backup generation and restore verification routine."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        source_db = tmp_path / "apex_test.duckdb"
        backup_dir = tmp_path / "backups"

        write_trades("run_backup_test", sample_50_trades, db_path=source_db)

        backup_file = backup_database(db_path=source_db, backup_dir=backup_dir)
        assert backup_file.exists()

        restored_ok = verify_restore(backup_file)
        assert restored_ok == True
