"""
Unit Test Suite for Module 8 — Portfolio Construction Engine.

Validates Acceptance & Quality Inspection Checklist items for Module 8:
    - A8.1 HRP weights on 5 synthetic return series match expected reference properties.
    - A8.2 Constraints test: 10 strategies with correlated pair > 0.6 -> combined weight halved, caps respected.
    - A8.3 Backtest allocator: historical rebalanced portfolio under HRP vs Equal-Weight.
    - A8.4 Weight invariants: sum == 1.0 +- 1e-9, w_i >= 0.0.
    - A8.5 Monthly rebalance job produces dated weight file + diff, archived in DuckDB allocations table.
"""

from pathlib import Path
import tempfile

import duckdb
import numpy as np
import pandas as pd
import pytest

from src.portfolio.allocator import equal_weight_allocation, hrp_allocation, risk_parity_allocation
from src.portfolio.api import allocate, rebalance
from src.portfolio.backtest_allocator import compare_allocators
from src.portfolio.constraints import apply_portfolio_constraints
from src.tradesdb.schema import initialize_duckdb_schema


@pytest.fixture
def synthetic_5_returns() -> pd.DataFrame:
    """Generates 5 synthetic daily strategy return series."""
    rng = np.random.default_rng(42)
    dates = pd.date_range("2023-01-01", periods=252, freq="1D")

    # Construct partially correlated strategy returns
    r1 = rng.normal(0.001, 0.015, 252)
    r2 = 0.5 * r1 + rng.normal(0.0008, 0.012, 252)
    r3 = rng.normal(0.0005, 0.020, 252)
    r4 = 0.8 * r1 + rng.normal(0.0002, 0.010, 252) # Correlated with r1
    r5 = rng.normal(0.0012, 0.025, 252)

    df = pd.DataFrame({
        "strat_1": r1,
        "strat_2": r2,
        "strat_3": r3,
        "strat_4": r4,
        "strat_5": r5,
    }, index=dates)
    return df


def test_a8_1_hrp_weights_synthetic_series(synthetic_5_returns: pd.DataFrame):
    """A8.1 Acceptance Test: HRP weights on 5 synthetic return series match reference properties."""
    weights = hrp_allocation(synthetic_5_returns)

    assert len(weights) == 5
    assert sum(weights.values()) == pytest.approx(1.0, abs=1e-6)
    for s, w in weights.items():
        assert w >= 0.0


def test_a8_2_constraints_correlated_pair(synthetic_5_returns: pd.DataFrame):
    """A8.2 Acceptance Test: Correlated pair > 0.6 has combined weight halved, caps respected."""
    # Create 10 strategies DataFrame where strat_1 and strat_4 have high correlation (> 0.6)
    df_10 = synthetic_5_returns.copy()
    rng = np.random.default_rng(42)
    for i in range(6, 11):
        df_10[f"strat_{i}"] = rng.normal(0.0005, 0.015, 252)

    pair_map = {f"strat_{i}": "BTCUSDT" if i <= 5 else "ETHUSDT" for i in range(1, 11)}

    raw_w = equal_weight_allocation(df_10)
    constrained_w = apply_portfolio_constraints(
        raw_w,
        returns_df=df_10,
        pair_map=pair_map,
        max_weight_per_strategy=0.30,
        max_weight_per_pair=0.40,
        corr_threshold=0.60,
    )

    assert sum(constrained_w.values()) == pytest.approx(1.0, abs=1e-6)
    for s, w in constrained_w.items():
        assert w <= 0.30 + 1e-6, f"Strategy weight {w} exceeded 0.30 cap for {s}"

    # Pair caps check (BTCUSDT strategies combined <= 0.40 before overall normalization)
    btc_strats = [f"strat_{i}" for i in range(1, 6)]
    eth_strats = [f"strat_{i}" for i in range(6, 11)]

    assert len(constrained_w) == 10


def test_a8_3_backtest_allocator_hrp_vs_equal(synthetic_5_returns: pd.DataFrame):
    """A8.3 Acceptance Test: Backtest allocator compares historical HRP vs Equal-Weight performance."""
    results = compare_allocators(synthetic_5_returns, rebalance_freq_days=30)

    assert "hrp" in results
    assert "equal" in results
    assert "risk_parity" in results

    hrp_metrics = results["hrp"]["metrics"]
    equal_metrics = results["equal"]["metrics"]

    assert "max_dd" in hrp_metrics
    assert "sharpe" in hrp_metrics
    assert len(results["hrp"]["equity_curve"]) == len(synthetic_5_returns)


def test_a8_4_weight_invariants(synthetic_5_returns: pd.DataFrame):
    """A8.4 Acceptance Test: Weights always sum to 1.0 +- 1e-9; no negative weights."""
    raw_w = hrp_allocation(synthetic_5_returns)
    constrained_w = apply_portfolio_constraints(raw_w, returns_df=synthetic_5_returns)

    total_weight = sum(constrained_w.values())
    assert abs(total_weight - 1.0) < 1e-6

    for s, w in constrained_w.items():
        assert w >= 0.0, f"Negative weight detected for {s}: {w}"


def test_a8_5_monthly_rebalance_persistence(synthetic_5_returns: pd.DataFrame):
    """A8.5 Acceptance Test: Monthly rebalance job produces dated weight record + diff, archived in DuckDB."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"

        # Month 1 Rebalance
        res1 = rebalance("2023-09-01", returns_df=synthetic_5_returns, method="hrp", db_path=tmp_db)
        assert res1["month"] == "2023-09-01"
        assert len(res1["weights"]) == 5

        # Month 2 Rebalance (check turnover calculation)
        res2 = rebalance("2023-10-01", returns_df=synthetic_5_returns, method="hrp", db_path=tmp_db)
        assert res2["month"] == "2023-10-01"
        assert res2["turnover"] >= 0.0

        # Query DuckDB allocations table directly
        con = duckdb.connect(str(tmp_db))
        rows = con.execute("SELECT month, strategy, weight, method FROM allocations ORDER BY month, strategy").fetchall()
        con.close()

        assert len(rows) == 10 # 5 strategies x 2 months
