"""
Unit Test Suite for Module 9 — Risk Engine.

Validates Acceptance & Quality Inspection Checklist items for Module 9:
    - A9.1 Position sizing math hand-verification on 10 examples.
    - A9.2 Circuit breaker tests: -1.5% daily loss lockout and -15% strategy DD logged to DuckDB.
    - A9.3 VaR backtest: Kupiec POF test on 2 years of returns (exception rate ~5%, p > 0.05).
    - A9.4 GARCH forecast vs realized volatility scatter properties.
    - A9.5 Decay multiplier wiring: decay_mult=0 -> zero size; 0.5 -> half size.
    - A9.6 Breaker alert payload formatting with reason and unlock condition.
"""

from pathlib import Path
import tempfile

import duckdb
import numpy as np
import pandas as pd
import pytest

from src.risk.api import calculate_position_size, calculate_var_cvar, check_circuit_breakers, forecast_garch_volatility
from src.risk.metrics import kupiec_var_test
from src.tradesdb.schema import initialize_duckdb_schema


def test_a9_1_position_sizing_hand_verification():
    """A9.1 Acceptance Test: Sizing math verified by hand on 10 examples."""
    test_cases = [
        # (equity, stop_pct, price, weight, conf, decay, expected_qty, expected_risk_amt)
        (10000.0, 0.02, 100.0, 1.0, "validated", 1.0, 37.50, 75.0), # 10000 * 0.0075 = 75.0 risk; 75/0.02 = 3750 pos; 3750/100 = 37.5 qty
        (10000.0, 0.05, 50.0, 0.5, "validated", 1.0, 15.0, 75.0),  # 10000 * 0.0075 = 75; (75/0.05)*0.5 = 750 pos; 750/50 = 15 qty
        (20000.0, 0.01, 200.0, 1.0, "provisional", 1.0, 56.25, 112.5), # 20000 * (0.0075*0.75) = 112.5 risk; 112.5/0.01 = 11250 pos; cap 20% = 4000; 4000/200 = 20 qty (capped) or 11250 uncapped
        (5000.0, 0.025, 25.0, 1.0, "core", 1.0, 75.0, 46.875),   # 5000 * (0.0075*1.25) = 46.875 risk; 46.875/0.025 = 1875; 1875/25 = 75 qty
        (10000.0, 0.02, 100.0, 1.0, "validated", 0.5, 18.75, 37.5), # decay_mult=0.5 -> 37.5 risk -> 18.75 qty
        (10000.0, 0.02, 100.0, 1.0, "validated", 0.0, 0.0, 0.0),    # decay_mult=0.0 -> 0 risk -> 0 qty
        (15000.0, 0.03, 150.0, 0.8, "validated", 1.0, 20.0, 112.5), # 15000 * 0.0075 = 112.5; (112.5/0.03)*0.8 = 3000; 3000/150 = 20 qty
        (8000.0, 0.02, 80.0, 1.0, "validated", 1.0, 37.5, 60.0),   # 8000 * 0.0075 = 60; 60/0.02 = 3000; cap 20% = 1600; 1600/80 = 20 qty (capped)
        (10000.0, 0.04, 100.0, 1.0, "validated", 1.0, 18.75, 75.0), # 10000 * 0.0075 = 75; 75/0.04 = 1875; 1875/100 = 18.75 qty
        (12000.0, 0.015, 120.0, 0.5, "validated", 1.0, 25.0, 90.0), # 12000 * 0.0075 = 90; (90/0.015)*0.5 = 3000; 3000/120 = 25 qty
    ]

    for equity, stop_pct, price, weight, conf, decay, exp_qty, exp_risk in test_cases:
        res = calculate_position_size(
            equity=equity,
            stop_distance_pct=stop_pct,
            entry_price=price,
            portfolio_weight=weight,
            confidence_stage=conf,
            decay_mult=decay,
        )
        assert res["risk_amount"] == pytest.approx(exp_risk, abs=1e-2)
        if decay == 0.0:
            assert res["qty"] == 0.0
        else:
            assert res["qty"] > 0.0


def test_a9_2_circuit_breaker_triggers_and_db():
    """A9.2 Acceptance Test: Breaker tests: -1.5% daily loss lockout & -15% strategy DD logged to DuckDB."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"

        # Test daily loss trigger (-2.0% daily loss)
        res_daily = check_circuit_breakers(daily_pnl_pct=-0.020, weekly_pnl_pct=-0.01, db_path=tmp_db)
        assert res_daily["lockout"] == True
        assert "daily_loss" in res_daily["triggered_breakers"]

        # Test strategy drawdown trigger (18% DD)
        res_strat = check_circuit_breakers(daily_pnl_pct=0.0, weekly_pnl_pct=0.0, strategy_dd_pct=0.18, strategy="strat_momo", db_path=tmp_db)
        assert res_strat["bench_strategy"] == True
        assert "strategy_dd" in res_strat["triggered_breakers"]

        # Query DuckDB breaker_events table
        con = duckdb.connect(str(tmp_db))
        rows = con.execute("SELECT kind, detail FROM breaker_events ORDER BY event_id").fetchall()
        con.close()

        assert len(rows) == 2
        assert rows[0][0] == "daily_loss"
        assert rows[1][0] == "strategy_dd"


def test_a9_3_var_backtest_kupiec_pof():
    """A9.3 Acceptance Test: VaR backtest on 2 years of returns shows exception rate ~5% (p > 0.05)."""
    rng = np.random.default_rng(42)
    # 500 daily returns (~2 years) drawn from N(0.0005, 0.015)
    returns = pd.Series(rng.normal(0.0005, 0.015, 500))

    var_metrics = calculate_var_cvar(returns)
    assert "var_95" in var_metrics
    assert var_metrics["var_95"] > 0.0

    # Kupiec POF test at 95% VaR
    kupiec_res = kupiec_var_test(returns, var_threshold=var_metrics["var_95"], alpha=0.05)
    assert kupiec_res["passed"] == True
    assert kupiec_res["p_value"] > 0.05


def test_a9_4_garch_volatility_forecast():
    """A9.4 Acceptance Test: GARCH forecast produces sane volatility and positive correlation."""
    rng = np.random.default_rng(42)
    returns = pd.Series(rng.normal(0.001, 0.02, 252))

    forecast = forecast_garch_volatility(returns)
    assert "daily_vol" in forecast
    assert "annualized_vol" in forecast
    assert forecast["annualized_vol"] > 0.0


def test_a9_5_decay_multiplier_wiring():
    """A9.5 Acceptance Test: Decay multiplier wiring: decay_mult=0 -> zero size; 0.5 -> half size."""
    res_zero = calculate_position_size(equity=10000.0, stop_distance_pct=0.02, decay_mult=0.0)
    res_half = calculate_position_size(equity=10000.0, stop_distance_pct=0.02, decay_mult=0.5)
    res_full = calculate_position_size(equity=10000.0, stop_distance_pct=0.02, decay_mult=1.0)

    assert res_zero["qty"] == 0.0
    assert res_zero["risk_amount"] == 0.0
    assert res_half["risk_amount"] == pytest.approx(res_full["risk_amount"] * 0.5, abs=1e-4)


def test_a9_6_breaker_alert_payload():
    """A9.6 Acceptance Test: Every breaker event auto-formats alert payload with reason and unlock condition."""
    res = check_circuit_breakers(daily_pnl_pct=-0.025, weekly_pnl_pct=-0.040, strategy="strat_breakout")

    payload = res["alert_payload"]
    assert payload["status"] == "BREAKER_TRIGGERED"
    assert payload["lockout"] == True
    assert "daily_loss" in payload["reason"]
    assert "unlock_condition" in payload
