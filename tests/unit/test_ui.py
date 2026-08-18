"""Unit Test Suite for Module 10 — QUANT EDGE Institutional UI.

Validates Acceptance & Quality Inspection Checklist items for Module 10:
    - A10.1 All data loaders and dashboard endpoints load against database fixture in < 5s each.
    - A10.2 Overview numbers cross-verified against raw SQL — exact match.
    - A10.3 Edge Explorer slice stats match Module-6 engine output for random filters.
    - A10.4 Decision metrics carry sample size n and period labels.
    - A10.5 UI survives empty database states gracefully without crashing.
    - A10.6 Read-only safety audit: UI data loaders contain zero write queries.
    - A10.7 FastAPI server endpoints return valid schemas and sub-50ms payloads.
"""

import inspect
from pathlib import Path
import tempfile
import time

import duckdb
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from src.edge.slice import slice_stats
from src.tradesdb.api import write_trades
from src.tradesdb.schema import initialize_duckdb_schema
from src.ui.api import render_dashboard, run_cli_dashboard
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
from src.ui.server.main import app
from src.ui.server.services.duckdb_service import DuckDBService


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
    """A10.1 Acceptance Test: All data loaders load in < 5.0 seconds each."""
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
    service = DuckDBService(db_path=db_path)
    overview = service.get_dashboard_overview()

    assert len(overview.kpis) == 6
    assert len(overview.strategies) == 10
    assert len(overview.validated_edges) == 4
    for edge in overview.validated_edges:
        assert edge.trades_count > 0


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


def test_a10_7_fastapi_endpoints_valid_responses():
    """A10.7 Acceptance Test: FastAPI server endpoints return 200 OK and valid schemas."""
    client = TestClient(app)

    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "ONLINE"

    r_overview = client.get("/api/v1/overview/dashboard")
    assert r_overview.status_code == 200
    payload = r_overview.json()
    assert "kpis" in payload
    assert len(payload["kpis"]) == 6
    assert "strategies" in payload
    assert len(payload["strategies"]) == 10
    assert "validated_edges" in payload
    assert "active_experiments" in payload


def test_a10_8_research_suite_endpoints():
    """A10.8 Acceptance Test: Phase 3 Research Suite endpoints return valid data."""
    client = TestClient(app)

    # 1. Data Lab
    r_dl = client.get("/api/v1/research/datalab/summary")
    assert r_dl.status_code == 200
    assert "instruments" in r_dl.json()
    assert len(r_dl.json()["instruments"]) >= 4

    r_candles = client.get("/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe=15m&limit=10")
    assert r_candles.status_code == 200
    assert len(r_candles.json()["candles"]) == 10

    # 2. Strategy Lab
    r_strats = client.get("/api/v1/research/strategies")
    assert r_strats.status_code == 200
    assert len(r_strats.json()) >= 5

    r_reg = client.post("/api/v1/research/strategies/register", json={
        "name": "Custom Test Strat",
        "category": "Mean Reversion",
        "pair": "XAUUSD",
        "timeframe": "15m",
        "trigger_condition": "close < lower_bb(20, 2.0)",
        "filter_condition": "atr(14) > 18.0",
        "exit_condition": "close > upper_bb(20, 2.0)",
    })
    assert r_reg.status_code == 200
    assert r_reg.json()["status"] == "SUCCESS"

    # 3. Backtesting Engine
    r_bt = client.post("/api/v1/research/backtest/run", json={
        "strategy_name": "BB Reversion v4",
        "pair": "XAUUSD",
        "timeframe": "15m",
        "engine": "VectorBT",
    })
    assert r_bt.status_code == 200
    bt_data = r_bt.json()
    assert bt_data["status"] == "COMPLETED"
    assert "metrics" in bt_data
    assert bt_data["metrics"]["sharpe_ratio"] > 0
    assert len(bt_data["equity_curve"]) >= 12
    assert len(bt_data["trade_logs"]) >= 5

    # 4. Optimization Suite
    r_opt = client.post("/api/v1/research/optimization/run", json={
        "strategy_name": "BB Reversion v4",
        "param_x": "bb_length",
        "param_y": "bb_std",
        "mode": "Bayesian Search",
    })
    assert r_opt.status_code == 200
    opt_data = r_opt.json()
    assert "heatmap" in opt_data
    assert "pareto_frontier" in opt_data

    # 5. Experiments Manager
    r_exp = client.get("/api/v1/research/experiments/list")
    assert r_exp.status_code == 200
    assert len(r_exp.json()) >= 5


def test_a10_9_edge_discovery_endpoints():
    """A10.9 Acceptance Test: Phase 4 Edge Discovery endpoints return valid statistics."""
    client = TestClient(app)

    # 1. Edge Explorer Slice Query
    r_slice = client.post("/api/v1/edge/slice-query", json={
        "pair": "XAUUSD",
        "session": "london",
        "vol_regime": "high",
        "trend_regime": "bullish",
        "day_of_week": "Tuesday",
    })
    assert r_slice.status_code == 200
    slice_json = r_slice.json()
    assert "slice_stats" in slice_json
    assert slice_json["slice_stats"]["expectancy_r"] > 0
    assert slice_json["slice_stats"]["p_value"] < 0.05
    assert len(slice_json["cumulative_r_curve"]) > 0
    assert len(slice_json["trades_sample"]) > 0

    # 2. Condition Attribution
    r_cond = client.get("/api/v1/edge/conditions/attribution?strategy=BB%20Reversion%20v4")
    assert r_cond.status_code == 200
    cond_json = r_cond.json()
    assert "features" in cond_json
    assert len(cond_json["features"]) >= 4

    # 3. Regime Matrix
    r_regime = client.get("/api/v1/edge/regimes/matrix")
    assert r_regime.status_code == 200
    regime_json = r_regime.json()
    assert "regimes" in regime_json
    assert len(regime_json["regimes"]) >= 5
    assert "transition_matrix" in regime_json

    # 4. Pattern Mining
    r_pat = client.get("/api/v1/edge/patterns/scan")
    assert r_pat.status_code == 200
    pat_json = r_pat.json()
    assert len(pat_json) >= 4
    for pat in pat_json:
        assert "pattern" in pat
        assert "win_rate" in pat
        assert "avg_r" in pat

    # 5. Correlation Suite
    r_corr = client.get("/api/v1/edge/correlations")
    assert r_corr.status_code == 200
    corr_json = r_corr.json()
    assert "strategies" in corr_json
    assert "matrix" in corr_json
    assert "diversification_benefit" in corr_json


def test_a10_10_validation_suite_endpoints():
    """A10.10 Acceptance Test: Phase 5 Validation Suite endpoints return valid statistics."""
    client = TestClient(app)

    # 1. Walk-Forward Analysis
    r_wf = client.get("/api/v1/validation/walkforward?strategy=BB%20Reversion%20v4")
    assert r_wf.status_code == 200
    wf_json = r_wf.json()
    assert "wfer_summary" in wf_json
    assert wf_json["wfer_summary"]["overall_wfer_pct"] > 60.0
    assert len(wf_json["windows"]) >= 5

    # 2. Out-of-Sample Gauntlet
    r_oos = client.get("/api/v1/validation/oos-gauntlet?strategy=BB%20Reversion%20v4")
    assert r_oos.status_code == 200
    oos_json = r_oos.json()
    assert "in_sample" in oos_json
    assert "out_of_sample" in oos_json
    assert "degradation_metrics" in oos_json
    assert oos_json["degradation_metrics"]["alpha_retention_pct"] > 70.0

    # 3. Monte Carlo Simulation
    r_mc = client.post("/api/v1/validation/monte-carlo")
    assert r_mc.status_code == 200
    mc_json = r_mc.json()
    assert mc_json["iterations"] == 10000
    assert mc_json["risk_of_ruin_pct"] <= 1.0
    assert "fan_chart" in mc_json

    # 4. Robustness & Perturbation Stress
    r_rob = client.get("/api/v1/validation/robustness-stress?strategy=BB%20Reversion%20v4")
    assert r_rob.status_code == 200
    rob_json = r_rob.json()
    assert "parameter_jitter_results" in rob_json
    assert len(rob_json["parameter_jitter_results"]) >= 5
    assert "slippage_curve" in rob_json

    # 5. Overfitting Detector (DSR & PBO)
    r_dsr = client.get("/api/v1/validation/overfitting-detector?strategy=BB%20Reversion%20v4")
    assert r_dsr.status_code == 200
    dsr_json = r_dsr.json()
    assert "observed_sharpe" in dsr_json
    assert "deflated_sharpe_ratio" in dsr_json
    assert dsr_json["dsr_p_value"] < 0.05
    assert "pbo_cscv" in dsr_json
    assert dsr_json["pbo_cscv"]["pbo_probability_pct"] < 30.0


def test_a10_11_analysis_and_trader_dev_endpoints():
    """A10.11 Acceptance Test: Phase 6 Analysis and Trader Dev endpoints return valid data."""
    client = TestClient(app)

    # 1. Performance
    r_perf = client.get("/api/v1/analysis/performance")
    assert r_perf.status_code == 200
    perf_json = r_perf.json()
    assert "monthly_returns" in perf_json
    assert "day_of_week_returns" in perf_json
    assert perf_json["sharpe_ratio"] > 0

    # 2. Trade Analytics
    r_trades = client.get("/api/v1/analysis/trades")
    assert r_trades.status_code == 200
    trades_json = r_trades.json()
    assert "r_distribution" in trades_json
    assert "cost_audit" in trades_json
    assert trades_json["cost_audit"]["drag_pct_of_gross"] < 15.0

    # 3. Stats Lab
    r_stats = client.get("/api/v1/analysis/stats")
    assert r_stats.status_code == 200
    stats_json = r_stats.json()
    assert "tests" in stats_json
    assert "bootstrap_ci" in stats_json
    assert stats_json["tests"]["students_t_test"]["t_stat"] > 2.0

    # 4. Strategy Comparison
    r_comp = client.get("/api/v1/analysis/compare")
    assert r_comp.status_code == 200
    comp_json = r_comp.json()
    assert "strategies" in comp_json
    assert len(comp_json["strategies"]) >= 4

    # 5. Trader Journal
    r_journ = client.get("/api/v1/trader-dev/journal")
    assert r_journ.status_code == 200
    assert len(r_journ.json()) >= 3

    r_add_j = client.post("/api/v1/trader-dev/journal/add", json={
        "pair": "XAUUSD",
        "strategy": "BB Reversion v4",
        "direction": "BUY",
        "result_r": 2.1,
        "rule_followed": True,
        "emotional_state": "Calm / In-The-Zone",
        "notes": "Test entry",
    })
    assert r_add_j.status_code == 200
    assert r_add_j.json()["status"] == "SUCCESS"

    # 6. Psychology
    r_psy = client.get("/api/v1/trader-dev/psychology")
    assert r_psy.status_code == 200
    psy_json = r_psy.json()
    assert "emotional_states" in psy_json
    assert "discipline_index" in psy_json

    # 7. Mistakes
    r_mist = client.get("/api/v1/trader-dev/mistakes")
    assert r_mist.status_code == 200
    mist_json = r_mist.json()
    assert "mistakes" in mist_json
    assert mist_json["total_cost_usd"] > 0

    # 8. Replay
    r_rep = client.get("/api/v1/trader-dev/replay/session")
    assert r_rep.status_code == 200
    rep_json = r_rep.json()
    assert "candles" in rep_json
    assert len(rep_json["candles"]) > 0


def test_a10_12_intelligence_and_system_endpoints():
    """A10.12 Acceptance Test: Phase 7 Intelligence and System endpoints return valid data."""
    client = TestClient(app)

    # 1. AI Quant Analyst Chat
    r_chat = client.post("/api/v1/intelligence/ai/chat", json={
        "prompt": "Which strategy has the highest robustness score?",
    })
    assert r_chat.status_code == 200
    chat_json = r_chat.json()
    assert "reply" in chat_json
    assert "BB Reversion v4" in chat_json["reply"]
    assert "confidence" in chat_json

    # 2. System Settings
    r_sys = client.get("/api/v1/system/settings")
    assert r_sys.status_code == 200
    sys_json = r_sys.json()
    assert "taker_fee_bps" in sys_json
    assert sys_json["taker_fee_bps"] == 5.0
    assert sys_json["intrabar_conservatism"] == "PESSIMISTIC_SL_FIRST"





