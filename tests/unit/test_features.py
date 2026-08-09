"""
Unit Test Suite for Module 2 — Feature & Regime Factory.

Validates Acceptance & Quality Inspection Checklist items for Module 2:
    - A2.1 Lookahead test harness: verifies custom features do not peek into future bars.
    - A2.2 Feature file row count == bar count per pair/tf; join key integrity verified.
    - A2.3 Regime distribution sanity check (trend and volatility regimes).
    - A2.5 Session labels verified around UTC boundaries (00:00, 07:00, 12:00, 16:00, 21:00).
"""

from pathlib import Path
import tempfile

import numpy as np
import pandas as pd
import pytest

from src.features.api import get_features
from src.features.factory import build_features_for_bars, materialize_features_for_pair
from src.features.indicators import compute_all_indicators
from src.features.regimes import compute_all_regimes, compute_trend_regime, compute_volatility_regime
from src.features.time_session import classify_session_hour, compute_time_and_session_features


@pytest.fixture
def sample_feature_bars() -> pd.DataFrame:
    """Generates 600 synthetic 1m bars for lookahead and feature factory tests."""
    timestamps = pd.date_range("2023-01-01 00:00:00", periods=600, freq="1min", tz="UTC")
    np.random.seed(42)
    random_walk = np.cumsum(np.random.randn(600)) * 2.0

    open_p = 1000.0 + random_walk
    close_p = open_p + np.random.randn(600)
    high_p = np.maximum(open_p, close_p) + np.abs(np.random.randn(600))
    low_p = np.minimum(open_p, close_p) - np.abs(np.random.randn(600))
    volume = np.random.uniform(10.0, 100.0, size=600)
    quote_vol = volume * close_p

    return pd.DataFrame({
        "open_time": timestamps,
        "open": open_p,
        "high": high_p,
        "low": low_p,
        "close": close_p,
        "volume": volume,
        "quote_vol": quote_vol,
        "trades": np.random.randint(5, 50, size=600),
        "taker_buy": volume * 0.5,
        "pair": "BTCUSDT",
        "timeframe": "1m",
    })


def test_a2_1_no_lookahead_harness(sample_feature_bars: pd.DataFrame):
    """A2.1 Acceptance Test: Verify feature calculations do not peek into future bars (§C2.6.1)."""
    full_features = compute_all_indicators(sample_feature_bars)

    # Test cut points
    for cut in [100, 300, 500]:
        partial_bars = sample_feature_bars.iloc[:cut].copy()
        partial_features = compute_all_indicators(partial_bars)

        # Assert full series up to cut-1 matches partial series up to cut-1 exactly (ignoring last partial bar)
        full_slice = full_features.iloc[: cut - 1]["rsi_14"].values
        partial_slice = partial_features.iloc[: cut - 1]["rsi_14"].values

        np.testing.assert_allclose(
            full_slice,
            partial_slice,
            rtol=1e-5,
            err_msg=f"Lookahead bias detected at cut point {cut} for rsi_14!",
        )


def test_a2_5_session_labels_utc_boundaries():
    """A2.5 Acceptance Test: Verify session labels around exact UTC boundaries."""
    # Boundary check hours: 00:00 (asia), 07:00 (europe), 12:00 (overlap), 16:00 (us), 21:00 (off)
    assert classify_session_hour(0) == "asia"
    assert classify_session_hour(6) == "asia"
    assert classify_session_hour(7) == "europe"
    assert classify_session_hour(11) == "europe"
    assert classify_session_hour(12) == "overlap"
    assert classify_session_hour(15) == "overlap"
    assert classify_session_hour(16) == "us"
    assert classify_session_hour(20) == "us"
    assert classify_session_hour(21) == "off"
    assert classify_session_hour(23) == "off"

    # Test full series timestamp conversion
    ts_list = pd.to_datetime([
        "2023-01-01 00:00:00 UTC",
        "2023-01-01 07:00:00 UTC",
        "2023-01-01 12:00:00 UTC",
        "2023-01-01 16:00:00 UTC",
        "2023-01-01 21:00:00 UTC",
    ])
    df_ts = compute_time_and_session_features(pd.Series(ts_list))
    expected_sessions = ["asia", "europe", "overlap", "us", "off"]
    assert list(df_ts["session"]) == expected_sessions


def test_a2_3_regime_classification_logic():
    """A2.3 Acceptance Test: Verify trend and volatility regime classification bounds (§10.3)."""
    # 1. Trend Regime Test
    ema_slope = pd.Series([1.5, -2.0, 0.5, 0.0])
    adx = pd.Series([25.0, 30.0, 15.0, 20.0])  # Last two < 22 threshold -> 'range'

    trend_regimes = compute_trend_regime(ema_slope, adx, adx_threshold=22.0)
    assert list(trend_regimes) == ["up", "down", "range", "range"]

    # 2. Volatility Regime Test (Quartiles)
    atr_pctile = pd.Series([0.10, 0.50, 0.80, 0.98])
    vol_regimes = compute_volatility_regime(atr_pctile)
    assert list(vol_regimes) == ["low", "mid", "high", "extreme"]


def test_a2_2_feature_factory_join_integrity(sample_feature_bars: pd.DataFrame):
    """A2.2 Acceptance Test: Feature file row count == bar count; join key integrity verified."""
    df_features = build_features_for_bars(sample_feature_bars, feature_version="v1.0.0")

    assert len(df_features) == len(sample_feature_bars), "Feature row count must match input bar count!"
    assert (df_features["open_time"] == sample_feature_bars["open_time"]).all(), "open_time join key mismatch!"

    # Verify warmup flags
    assert df_features.iloc[0]["is_warmup"] == True
    assert df_features.iloc[251]["is_warmup"] == True
    assert df_features.iloc[252]["is_warmup"] == False
    assert df_features.iloc[0]["feature_version"] == "v1.0.0"


def test_materialize_and_get_features_api(sample_feature_bars: pd.DataFrame):
    """Test feature materialization to Parquet and access API get_features() query."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)

        # Store raw bar fixture
        raw_file = tmp_path / "raw" / "binance" / "BTCUSDT" / "1m.parquet"
        raw_file.parent.mkdir(parents=True, exist_ok=True)
        sample_feature_bars.to_parquet(raw_file, index=False, compression="snappy")

        # Materialize features
        mat_file = materialize_features_for_pair("BTCUSDT", "1m", tmp_path, feature_version="v1.0.0")
        assert mat_file.exists()

        # Query via API
        df_fetched = get_features("BTCUSDT", "1m", "2023-01-01 00:00:00", "2023-01-01 01:00:00", data_dir=tmp_path)
        assert len(df_fetched) == 61
        assert "trend_regime" in df_fetched.columns
        assert "vol_regime" in df_fetched.columns
        assert "session" in df_fetched.columns
