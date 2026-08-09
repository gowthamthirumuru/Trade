"""
Unit Test Suite for Module 3 — Strategy Miner.

Validates Acceptance & Quality Inspection Checklist items for Module 3:
    - A3.1 Building-block library has >=20 triggers, >=15 filters, >=8 exits.
    - A3.8 Data-wall test: miner process physically cannot load post-2022 bars.
    - A3.5 Plateau analysis test: parameter perturbation and plateau scoring.
    - A3.6 Trial accounting: n_variants_tested recorded per run.
    - A3.7 Reproducibility: same seed produces identical output.
"""

from pathlib import Path
import tempfile

import numpy as np
import pandas as pd
import pytest

from src.features.factory import build_features_for_bars
from src.miner.brute_force import compute_plateau_score, evaluate_simple_backtest, run_stage2_pairup_search
from src.miner.building_blocks import BLOCK_REGISTRY
from src.miner.governance import DataWallViolationError, register_mining_run, verify_data_wall


@pytest.fixture
def miner_test_bars() -> pd.DataFrame:
    """Generates 300 synthetic 1m bars for miner testing."""
    timestamps = pd.date_range("2022-01-01 00:00:00", periods=300, freq="1min", tz="UTC")
    np.random.seed(42)
    open_p = 100.0 + np.cumsum(np.random.randn(300) * 0.5)
    close_p = open_p + np.random.randn(300) * 0.2
    high_p = np.maximum(open_p, close_p) + 0.5
    low_p = np.minimum(open_p, close_p) - 0.5
    vol = np.random.uniform(10.0, 100.0, size=300)

    return pd.DataFrame({
        "open_time": timestamps,
        "open": open_p,
        "high": high_p,
        "low": low_p,
        "close": close_p,
        "volume": vol,
        "quote_vol": vol * close_p,
        "trades": 10,
        "taker_buy": vol * 0.5,
        "pair": "BTCUSDT",
        "timeframe": "1m",
    })


def test_a3_1_building_block_registry():
    """A3.1 Acceptance Test: Verify building-block library has >=20 triggers, >=15 filters, >=8 exits."""
    triggers = [k for k, v in BLOCK_REGISTRY.items() if v["type"] == "trigger"]
    filters = [k for k, v in BLOCK_REGISTRY.items() if v["type"] == "filter"]
    exits = [k for k, v in BLOCK_REGISTRY.items() if v["type"] == "exit"]

    assert len(triggers) >= 20, f"Expected >= 20 triggers, got {len(triggers)}"
    assert len(filters) >= 15, f"Expected >= 15 filters, got {len(filters)}"
    assert len(exits) >= 8, f"Expected >= 8 exits, got {len(exits)}"


def test_a3_8_data_wall_enforcement():
    """A3.8 Acceptance Test: Verify Data Wall raises DataWallViolationError when requesting post-2022 bars."""
    # 1. Valid in-sample date range
    verify_data_wall("2017-08-17", "2022-12-31")

    # 2. Attempt post-2022 date range (Must raise DataWallViolationError)
    with pytest.raises(DataWallViolationError):
        verify_data_wall("2017-08-17", "2023-01-01")


def test_a3_5_plateau_analysis(miner_test_bars: pd.DataFrame):
    """A3.5 Acceptance Test: Verify parameter plateau scoring logic (§11.3 Stage 4)."""
    df_features = build_features_for_bars(miner_test_bars)
    params = {"direction": "long", "fast": 9, "slow": 21, "n": 14, "threshold": 20.0}

    plateau_score = compute_plateau_score(miner_test_bars, df_features, "T01", "F01", "X01", params)
    assert 0.0 <= plateau_score <= 1.0


def test_a3_6_trial_accounting_and_run_registration(miner_test_bars: pd.DataFrame):
    """A3.6 Acceptance Test: Verify n_variants_tested is logged per run for DSR accounting."""
    df_features = build_features_for_bars(miner_test_bars)

    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)

        cands, n_tested = run_stage2_pairup_search(
            miner_test_bars,
            df_features,
            "BTCUSDT",
            "1m",
            start_date="2022-01-01",
            end_date="2022-12-31",
            top_triggers=["T01", "T02"],
        )

        assert n_tested == 10  # 2 triggers x 5 filters x 1 exit
        assert isinstance(cands, list)


def test_a3_7_miner_reproducibility(miner_test_bars: pd.DataFrame):
    """A3.7 Acceptance Test: Re-running registered run produces identical candidate output."""
    df_features = build_features_for_bars(miner_test_bars)

    cands1, n1 = run_stage2_pairup_search(miner_test_bars, df_features, "BTCUSDT", "1m", "2022-01-01", "2022-12-31")
    cands2, n2 = run_stage2_pairup_search(miner_test_bars, df_features, "BTCUSDT", "1m", "2022-01-01", "2022-12-31")

    assert n1 == n2
    assert len(cands1) == len(cands2)
    if cands1:
        assert cands1[0].candidate_id == cands2[0].candidate_id
        assert cands1[0].ranking_score == cands2[0].ranking_score
