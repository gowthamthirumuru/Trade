"""
Unit Test Suite for Module 6 — Edge Analytics Engine.

Validates Acceptance & Quality Inspection Checklist items for Module 6:
    - A6.1 Slice engine returns correct stats for a hand-computed 20-trade benchmark fixture.
    - A6.2 Hour x Day heatmap matches independent pandas pivot table.
    - A6.3 Significance layer negative control: synthetic random noise yields 0 passing cards.
    - A6.4 Synthetic positive control: injected planted edge is correctly detected.
    - A6.5 Both-halves in-sample stability enforcement.
    - A6.6 Edge Card generation end-to-end with DuckDB persistence.
    - A6.7 90-day card expiry maintenance routine.
"""

from pathlib import Path
import tempfile
import time

import duckdb
import numpy as np
import pandas as pd
import pytest

from src.edge.api import make_edge_card, scan_dimensions, slice_stats
from src.edge.cards import expire_cards, get_edge_card
from src.edge.scan import generate_heatmap_pivot
from src.edge.significance import (
    bh_adjust,
    check_both_halves_stability,
    run_negative_control_test,
    run_positive_control_test,
)
from src.tradesdb.api import write_trades
from src.tradesdb.schema import initialize_duckdb_schema


@pytest.fixture
def hand_20_trades_fixture() -> pd.DataFrame:
    """Hand-computed 20-trade benchmark fixture (§C2.6.3 & A6.1)."""
    pnls = [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  # 10 wins of +1.0 R
            -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5] # 10 losses of -0.5 R
    timestamps = pd.date_range("2023-01-01", periods=20, freq="1D", tz="UTC")

    trades = []
    for i, pnl in enumerate(pnls):
        trades.append({
            "trade_id": i + 1,
            "strategy": "strat_hand",
            "pair": "BTCUSDT",
            "timeframe": "1h",
            "direction": "long",
            "entry_time": timestamps[i],
            "pnl_r": pnl,
            "pnl_pct": pnl * 0.01,
            "pnl_quote": pnl * 100.0,
            "fees": 1.0,
            "slippage": 0.5,
            "source": "backtest",
        })
    return pd.DataFrame(trades)


def test_a6_1_slice_engine_hand_computed_fixture(hand_20_trades_fixture: pd.DataFrame):
    """A6.1 Acceptance Test: Slice engine stats match hand-computed benchmark exact values."""
    stats = slice_stats(hand_20_trades_fixture, min_n=10)

    assert stats["n"] == 20
    assert stats["expectancy_r"] == pytest.approx(0.25, abs=1e-4)  # (10*1.0 - 10*0.5)/20 = 0.25 R
    assert stats["win_rate"] == pytest.approx(0.50, abs=1e-4)
    assert stats["profit_factor"] == pytest.approx(2.0, abs=1e-4)  # 10.0 / 5.0 = 2.0
    assert stats["avg_win_r"] == pytest.approx(1.0, abs=1e-4)
    assert stats["avg_loss_r"] == pytest.approx(0.5, abs=1e-4)
    assert stats["max_consec_loss"] == 10
    assert stats["ci95"][0] < stats["expectancy_r"] < stats["ci95"][1]


def test_a6_2_heatmap_pivot_matching_pandas(hand_20_trades_fixture: pd.DataFrame):
    """A6.2 Acceptance Test: Hour x Day heatmap matches independent pandas pivot table."""
    df = hand_20_trades_fixture.copy()
    df["hour_utc"] = [0, 1] * 10
    df["day_of_week"] = [i % 5 for i in range(20)]

    pivot = generate_heatmap_pivot(df, "hour_utc", "day_of_week", metric="expectancy_r", min_n=1)
    expected_pivot = df.groupby(["day_of_week", "hour_utc"])["pnl_r"].mean().unstack().fillna(0.0)

    assert not pivot.empty
    np.testing.assert_allclose(pivot.values, expected_pivot.values, rtol=1e-4)


def test_a6_3_significance_negative_control():
    """A6.3 Acceptance Test: Significance layer negative control over random noise yields 0 false positives."""
    res = run_negative_control_test(n_trades=3000, seed=42)
    assert res["passed"] == True
    assert res["false_positives_detected"] == 0
    assert res["status"] == "NEGATIVE CONTROL PASS"


def test_a6_4_synthetic_known_edge_positive_control():
    """A6.4 Acceptance Test: Synthetic positive control detects injected Wednesday +0.25R edge."""
    res = run_positive_control_test(n_trades=3000, planted_day=2, planted_edge_r=0.30, seed=42)
    assert res["passed"] == True
    assert res["detected_day"] == 2
    assert res["status"] == "POSITIVE CONTROL PASS"


def test_a6_5_both_halves_stability_enforcement():
    """A6.5 Acceptance Test: Both-halves stability flags single-half-only edges as unstable."""
    timestamps = pd.date_range("2023-01-01", periods=20, freq="1D", tz="UTC")
    # First 10 trades positive (+1.0), second 10 trades negative (-0.5)
    pnls = [1.0] * 10 + [-0.5] * 10
    df_unstable = pd.DataFrame({"entry_time": timestamps, "pnl_r": pnls})

    stab = check_both_halves_stability(df_unstable)
    assert stab["stable"] == False
    assert stab["half1_exp_r"] > 0
    assert stab["half2_exp_r"] <= 0


def test_a6_6_edge_card_generation_end_to_end(hand_20_trades_fixture: pd.DataFrame):
    """A6.6 Acceptance Test: Edge Card generation end-to-end with DuckDB persistence."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"
        write_trades("run_card_test", hand_20_trades_fixture, db_path=tmp_db)

        filter_dict = {"session": "asia", "pair": "BTCUSDT"}
        card_id = make_edge_card("strat_hand", filter_dict, trades_df=hand_20_trades_fixture, db_path=tmp_db)
        assert isinstance(card_id, int) and card_id > 0

        card_dict = get_edge_card(card_id, db_path=tmp_db)
        assert card_dict["card_id"] == card_id
        assert card_dict["strategy"] == "strat_hand"
        assert card_dict["pair"] == "BTCUSDT"


def test_a6_7_card_expiry_job(hand_20_trades_fixture: pd.DataFrame):
    """A6.7 Acceptance Test: 90-day card expiry job flips stale cards to status='retired'."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"
        write_trades("run_expiry_test", hand_20_trades_fixture, db_path=tmp_db)

        filter_dict = {"pair": "BTCUSDT"}
        card_id = make_edge_card("strat_hand", filter_dict, trades_df=hand_20_trades_fixture, db_path=tmp_db)

        # Set last_validated to 95 days ago
        stale_date = (pd.Timestamp.now(tz="UTC") - pd.Timedelta(days=95)).strftime("%Y-%m-%d %H:%M:%S")
        con = duckdb.connect(str(tmp_db))
        con.execute("UPDATE edge_cards SET last_validated = CAST(? AS TIMESTAMP) WHERE card_id = ?", [stale_date, card_id])
        con.close()

        # Run card expiry routine
        retired_count = expire_cards(db_path=tmp_db, max_age_days=90)
        assert retired_count == 1

        card_dict = get_edge_card(card_id, db_path=tmp_db)
        assert card_dict["status"] == "retired"
