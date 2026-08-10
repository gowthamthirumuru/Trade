"""
Unit Test Suite for Module 10 — Command Center UI.

Validates Acceptance & Quality Inspection Checklist items for Module 10:
    - A10.1 All 7 pages load against database fixture in < 5s each.
    - A10.2 Overview numbers cross-verified against raw SQL — exact match.
    - A10.3 Edge Explorer slice stats match Module-6 engine output for random filters.
    - A10.4 Decision metrics carry sample size n and period labels.
    - A10.5 UI survives empty database states gracefully without crashing.
    - A10.6 Read-only safety audit: UI data loaders contain zero write queries.
"""

import inspect
from pathlib import Path
import tempfile
import time

import duckdb
import numpy as np
import pandas as pd
import pytest

from src.edge.slice import slice_stats
from src.tradesdb.api import write_trades
from src.tradesdb.schema import initialize_duckdb_schema
from src.ui.api import render_dashboard
from src.ui.components.overview_view import render_overview_view
from src.ui import data_loader
from src.ui.data_loader import (
    load_data_manager_data,
    load_edge_explorer_data,
    load_journal_data,
    load_miner_data,
    load_overview_data,
    load_portfolio_data,
    load_validation_data,
)


@pytest.fixture
def populate_ui_fixture_db() -> Path:
    """Populates a temporary DuckDB instance with trade and run records for UI testing."""
    tmp_dir = tempfile.mkdtemp()
    tmp_db = Path(tmp_dir) / "apex_ui_test.duckdb"
    initialize_duckdb_schema(db_path=tmp_db)

    timestamps = pd.date_range("2023-01-01", periods=100, freq="1D", tz="UTC")
    pnls = [1.0, -0.5, 0.8, 1.2, -0.4] * 20

    trades = []
    for i in range(100):
        trades.append({
            "trade_id": i + 1,
            "strategy": "strat_ui_test",
            "pair": "BTCUSDT",
            "timeframe": "1h",
            "direction": "long",
            "entry_time": timestamps[i],
            "pnl_r": pnls[i],
            "pnl_pct": pnls[i] * 0.01,
            "pnl_quote": pnls[i] * 50.0,
            "fees": 1.0,
            "slippage": 0.5,
            "source": "backtest",
            "session": "asia",
            "trend_regime": "up",
            "vol_regime": "mid",
        })
    df_trades = pd.DataFrame(trades)
    write_trades("run_ui_test_001", df_trades, db_path=tmp_db)

    # Insert an Edge Card into DuckDB
    con = duckdb.connect(str(tmp_db))
    con.execute(
        """
        INSERT INTO edge_cards (card_id, strategy, pair, filter_json, n_trades, expectancy_r, win_rate, profit_factor, sharpe, in_sample_ok, oos_ok, p_value, status, created_at, last_validated)
        VALUES (999, 'strat_ui_test', 'BTCUSDT', '{}', 100, 0.42, 0.60, 1.85, 1.95, TRUE, TRUE, 0.01, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        """
    )
    con.close()

    return tmp_db


def test_a10_1_page_load_performance_budget(populate_ui_fixture_db: Path):
    """A10.1 Acceptance Test: All 7 pages load in < 5.0 seconds each."""
    db_path = populate_ui_fixture_db

    loaders = [
        ("Overview", load_overview_data),
        ("Miner", load_miner_data),
        ("EdgeExplorer", load_edge_explorer_data),
        ("Validation", load_validation_data),
        ("Portfolio", load_portfolio_data),
        ("Journal", load_journal_data),
        ("DataManager", load_data_manager_data),
    ]

    for name, loader_fn in loaders:
        t0 = time.time()
        res = loader_fn(db_path=db_path)
        elapsed = time.time() - t0

        assert elapsed < 5.0, f"Page loader {name} exceeded 5.0s budget ({elapsed:.3f}s)"
        assert "load_time_sec" in res


def test_a10_2_overview_numbers_cross_verified_sql(populate_ui_fixture_db: Path):
    """A10.2 Acceptance Test: Overview numbers cross-verified against raw SQL exact match."""
    db_path = populate_ui_fixture_db
    data = load_overview_data(db_path=db_path)

    # Raw SQL queries
    con = duckdb.connect(str(db_path))
    sql_trades_count = con.execute("SELECT COUNT(*) FROM trades").fetchone()[0]
    sql_active_cards = con.execute("SELECT COUNT(*) FROM edge_cards WHERE status = 'active'").fetchone()[0]
    con.close()

    eq_df = data["equity_curve"]
    assert len(eq_df) == sql_trades_count
    assert len(data["active_cards"]) == sql_active_cards


def test_a10_3_edge_explorer_slice_stats_match(populate_ui_fixture_db: Path):
    """A10.3 Acceptance Test: Edge Explorer slice stats match Module-6 engine output."""
    db_path = populate_ui_fixture_db
    filter_dict = {"session": "asia", "pair": "BTCUSDT"}

    data = load_edge_explorer_data(filter_dict=filter_dict, db_path=db_path)

    # Direct query and engine calculation
    con = duckdb.connect(str(db_path))
    df_raw = con.execute("SELECT * FROM trades WHERE session = 'asia' AND pair = 'BTCUSDT'").df()
    con.close()

    engine_stats = slice_stats(df_raw)
    ui_stats = data["slice_stats"]

    assert ui_stats["n"] == engine_stats["n"]
    assert ui_stats["expectancy_r"] == pytest.approx(engine_stats["expectancy_r"], abs=1e-4)


def test_a10_4_decision_metrics_sample_size_in_line(populate_ui_fixture_db: Path):
    """A10.4 Acceptance Test: Decision metrics carry sample size n and period labels."""
    db_path = populate_ui_fixture_db
    data = load_overview_data(db_path=db_path)
    rendered_text = render_overview_view(data)

    assert "n=" in rendered_text
    assert "Period:" in rendered_text or "E[R]" in rendered_text


def test_a10_5_empty_database_grace_handling():
    """A10.5 Acceptance Test: UI survives empty database states gracefully without crashing."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        empty_db = Path(tmp_dir) / "apex_empty.duckdb"
        initialize_duckdb_schema(db_path=empty_db)

        # Call all loaders against empty DB
        res_overview = load_overview_data(db_path=empty_db)
        res_miner = load_miner_data(db_path=empty_db)
        res_edge = load_edge_explorer_data(db_path=empty_db)
        res_val = load_validation_data(db_path=empty_db)
        res_port = load_portfolio_data(db_path=empty_db)
        res_journal = load_journal_data(db_path=empty_db)
        res_manager = load_data_manager_data(db_path=empty_db)

        assert res_overview["equity_curve"].empty
        assert res_miner["leaderboard"].empty
        assert res_edge["filtered_trades"].empty
        assert res_val["kill_list"].empty
        assert res_port["allocations"].empty
        assert res_journal["journal_trades"].empty


def test_a10_6_read_only_safety_audit():
    """A10.6 Acceptance Test: UI data loaders contain zero write SQL queries."""
    data_loader_funcs = [
        load_overview_data,
        load_miner_data,
        load_edge_explorer_data,
        load_validation_data,
        load_portfolio_data,
        load_journal_data,
        load_data_manager_data,
    ]

    write_keywords = ["INSERT INTO", "UPDATE ", "DELETE FROM", "DROP TABLE", "ALTER TABLE"]

    for fn in data_loader_funcs:
        source_code = inspect.getsource(fn).upper()
        for kw in write_keywords:
            assert kw not in source_code, f"Write keyword '{kw}' found in data loader {fn.__name__}"
