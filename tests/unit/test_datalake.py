"""
Unit Test Suite for Module 1 — Data Lake.

Validates Acceptance & Quality Inspection Checklist items for Module 1:
    - A1.4 Resample unit test: synthetic 1m series with known values produces hand-verified 5m/1h bars.
    - A1.5 Updater idempotency test: second run inserts 0 duplicates.
    - A1.6 Validator checks on synthetic defect series (gaps, dupes, OHLC violations).
    - A1.7 DuckDB views and get_bars() API query responsiveness.
"""

from pathlib import Path
import tempfile

import duckdb
import numpy as np
import pandas as pd
import pytest

from src.datalake.api import get_bars, register_duckdb_views
from src.datalake.resample import resample_bars
from src.datalake.updater import update_pair_nightly
from src.datalake.validate import DataQualityReport, validate_bars, validate_duplicates, validate_ohlc_sanity


@pytest.fixture
def synthetic_1m_bars() -> pd.DataFrame:
    """Generates 120 synthetic 1m bars (2 hours) with known mathematical patterns.

    Bar 0 to 59 (Hour 1):
        Open: 100.0, Close rises linearly 100.0 -> 159.0
        High: Close + 1.0, Low: Open - 1.0
        Volume: 10.0 per bar (Total 600.0 per hour)
        Trades: 5 per bar (Total 300 per hour)
        Taker Buy: 6.0 per bar (Total 360.0 per hour)

    Bar 60 to 119 (Hour 2):
        Open: 160.0, Close falls linearly 160.0 -> 101.0
        High: Open + 1.0, Low: Close - 1.0
        Volume: 20.0 per bar (Total 1200.0 per hour)
        Trades: 10 per bar (Total 600 per hour)
        Taker Buy: 12.0 per bar (Total 720.0 per hour)
    """
    timestamps = pd.date_range("2023-01-01 00:00:00", periods=120, freq="1min", tz="UTC")
    bars = []

    for i in range(120):
        if i < 60:
            open_p = 100.0 + i
            close_p = 100.0 + i + 0.5
            high_p = close_p + 1.0
            low_p = open_p - 1.0
            vol = 10.0
            quote_vol = vol * close_p
            trades = 5
            taker_buy = 6.0
        else:
            open_p = 200.0 - (i - 60)
            close_p = 200.0 - (i - 60) - 0.5
            high_p = open_p + 1.0
            low_p = close_p - 1.0
            vol = 20.0
            quote_vol = vol * close_p
            trades = 10
            taker_buy = 12.0

        bars.append({
            "open_time": timestamps[i],
            "open": open_p,
            "high": high_p,
            "low": low_p,
            "close": close_p,
            "volume": vol,
            "quote_vol": quote_vol,
            "trades": trades,
            "taker_buy": taker_buy,
            "pair": "BTCUSDT",
            "timeframe": "1m",
        })

    return pd.DataFrame(bars)


def test_a1_4_resample_unit_test(synthetic_1m_bars: pd.DataFrame):
    """A1.4 Acceptance Test: Verify synthetic 1m series produces hand-verified 5m and 1h bars."""
    # 1. Test 1h Resampling
    df_1h = resample_bars(synthetic_1m_bars, target_timeframe="1h")
    assert len(df_1h) == 2, f"Expected 2 1h bars, got {len(df_1h)}"

    # Hour 1 Verification (00:00:00)
    h1 = df_1h.iloc[0]
    assert h1["open_time"] == pd.Timestamp("2023-01-01 00:00:00", tz="UTC")
    assert h1["open"] == 100.0
    assert h1["close"] == 159.5
    assert h1["volume"] == pytest.approx(600.0)
    assert h1["trades"] == 300
    assert h1["taker_buy"] == pytest.approx(360.0)

    # Hour 2 Verification (01:00:00)
    h2 = df_1h.iloc[1]
    assert h2["open_time"] == pd.Timestamp("2023-01-01 01:00:00", tz="UTC")
    assert h2["open"] == 200.0
    assert h2["close"] == 140.5
    assert h2["volume"] == pytest.approx(1200.0)
    assert h2["trades"] == 600
    assert h2["taker_buy"] == pytest.approx(720.0)

    # 2. Test 5m Resampling
    df_5m = resample_bars(synthetic_1m_bars, target_timeframe="5m")
    assert len(df_5m) == 24, f"Expected 24 5m bars, got {len(df_5m)}"

    # First 5m Bar Verification (00:00 to 00:04)
    b1 = df_5m.iloc[0]
    assert b1["open"] == 100.0
    assert b1["volume"] == pytest.approx(50.0)
    assert b1["trades"] == 25


def test_validator_detects_defects(synthetic_1m_bars: pd.DataFrame):
    """Test validator detection of OHLC sanity errors, duplicate timestamps, and gaps."""
    report = DataQualityReport()

    # 1. Inject duplicate timestamp
    corrupted_dupes = pd.concat([synthetic_1m_bars, synthetic_1m_bars.iloc[[0]]], ignore_index=True)
    deduped = validate_duplicates(corrupted_dupes, "BTCUSDT", "1m", report)
    assert report.duplicates_found == 1
    assert len(deduped) == len(synthetic_1m_bars)

    # 2. Inject OHLC sanity violation (High < Open)
    corrupted_ohlc = synthetic_1m_bars.copy()
    corrupted_ohlc.loc[10, "high"] = 50.0  # Invalid high lower than open 110.0
    cleaned_ohlc = validate_ohlc_sanity(corrupted_ohlc, "BTCUSDT", "1m", report)
    assert report.ohlc_violations == 1
    assert len(cleaned_ohlc) == len(synthetic_1m_bars) - 1


def test_a1_5_updater_idempotency(synthetic_1m_bars: pd.DataFrame):
    """A1.5 Acceptance Test: Nightly updater dry-run completes; second run inserts 0 duplicates."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)

        # Pre-seed Data Lake with initial 60 bars
        base_file = tmp_path / "raw" / "binance" / "BTCUSDT" / "1m.parquet"
        base_file.parent.mkdir(parents=True, exist_ok=True)
        synthetic_1m_bars.iloc[:60].to_parquet(base_file, index=False, compression="snappy")

        # Mock CCXT exchange returning existing + 10 new bars
        class DummyExchange:
            def fetch_ohlcv(self, symbol, timeframe, since, limit):
                # Return bars starting from since
                subset = synthetic_1m_bars.iloc[50:70]  # Overlaps 10 bars, adds 10 new
                raw = []
                for _, row in subset.iterrows():
                    ms = int(row["open_time"].timestamp() * 1000)
                    raw.append([ms, row["open"], row["high"], row["low"], row["close"], row["volume"]])
                return raw

        dummy_exchange = DummyExchange()

        # Run 1: Should append 10 new bars (Total 70)
        res1 = update_pair_nightly("BTCUSDT", tmp_path, exchange=dummy_exchange)
        df_after_run1 = pd.read_parquet(base_file)
        assert len(df_after_run1) == 70

        # Run 2: Re-running with same since should insert 0 new duplicates (Idempotent)
        res2 = update_pair_nightly("BTCUSDT", tmp_path, exchange=dummy_exchange)
        df_after_run2 = pd.read_parquet(base_file)
        assert len(df_after_run2) == 70, f"Expected 70 bars after second run, got {len(df_after_run2)}"
        assert res2["1m"] == 0


def test_a1_7_get_bars_api_and_duckdb_views(synthetic_1m_bars: pd.DataFrame):
    """A1.7 Acceptance Test: Access layer get_bars() and DuckDB views query responsiveness."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)

        # Store synthetic 1m and resampled 1h Parquet files
        base_file = tmp_path / "raw" / "binance" / "BTCUSDT" / "1m.parquet"
        base_file.parent.mkdir(parents=True, exist_ok=True)
        synthetic_1m_bars.to_parquet(base_file, index=False, compression="snappy")

        df_1h = resample_bars(synthetic_1m_bars, target_timeframe="1h")
        h1_file = tmp_path / "raw" / "binance" / "BTCUSDT" / "1h.parquet"
        df_1h.to_parquet(h1_file, index=False, compression="snappy")

        # 1. Test get_bars() date range pushdown query
        bars_slice = get_bars("BTCUSDT", "1m", "2023-01-01 00:00:00", "2023-01-01 00:29:00", data_dir=tmp_path)
        assert len(bars_slice) == 30
        assert bars_slice["pair"].iloc[0] == "BTCUSDT"

        # 2. Test register_duckdb_views()
        con = duckdb.connect(database=":memory:")
        register_duckdb_views(con, data_dir=tmp_path)

        res = con.execute("SELECT COUNT(*), MIN(open_time), MAX(open_time) FROM v_bars_1h GROUP BY pair").fetchall()
        assert len(res) == 1
        count, min_t, max_t = res[0]
        assert count == 2
        con.close()
