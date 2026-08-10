"""
Unit Test Suite for Dukascopy Forex Data Lake Ingestion & Cost Engine.

Validates Forex bar ingestion, DST-aware session labeling, Forex cost modeling,
and Data Lake API integration as mandated by Master Plan Chapter 23.
"""

from pathlib import Path
import sys
import tempfile
import pandas as pd
import pytest

PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.backtest.forex_costs import ForexCostConfig, calculate_forex_trade_cost
from src.datalake.api import get_bars
from src.datalake.dukascopy import (
    compute_dst_aware_forex_session,
    download_forex_history,
    fetch_dukascopy_bars,
    format_forex_canonical_bars,
)


def test_compute_dst_aware_forex_session():
    """Tests DST-aware Forex financial market session classification (§23 Item 2)."""
    # 14:00 UTC (10:00 AM NY / 15:00 PM London) -> Overlap
    ts_overlap = pd.Timestamp("2024-06-12 14:00:00", tz="UTC")
    assert compute_dst_aware_forex_session(ts_overlap) == "overlap"

    # 09:00 UTC (05:00 AM NY / 10:00 AM London) -> London
    ts_london = pd.Timestamp("2024-06-12 09:00:00", tz="UTC")
    assert compute_dst_aware_forex_session(ts_london) == "london"

    # 01:00 UTC (09:00 PM NY) -> Asia
    ts_asia = pd.Timestamp("2024-06-12 01:00:00", tz="UTC")
    assert compute_dst_aware_forex_session(ts_asia) == "asia"


def test_fetch_dukascopy_bars():
    """Tests Dukascopy bar fetching and canonical schema formatting."""
    df_bars = fetch_dukascopy_bars(pair="EURUSD", timeframe="15m", start_date="2024-01-01", end_date="2024-01-05")

    assert not df_bars.empty
    assert "open_time" in df_bars.columns
    assert "session" in df_bars.columns
    assert df_bars["pair"].iloc[0] == "EURUSD"
    assert df_bars["timeframe"].iloc[0] == "15m"


def test_download_forex_history():
    """Tests Forex history downloading and Parquet persistence."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)
        res = download_forex_history(pairs=["EURUSD", "GBPUSD"], timeframe="15m", data_dir=tmp_path)

        assert res["status"] == "SUCCESS"
        assert res["pairs_processed"] == 2

        # Verify Parquet file created
        parquet_file = tmp_path / "raw" / "dukascopy" / "EURUSD" / "15m.parquet"
        assert parquet_file.exists()


def test_forex_costs_calculation():
    """Tests Chapter 23 Forex variable spread and Wednesday triple swap financing costs."""
    entry_ts = pd.Timestamp("2024-06-10 10:00:00", tz="UTC")  # Monday
    exit_ts = pd.Timestamp("2024-06-13 10:00:00", tz="UTC")   # Thursday (crosses Wednesday 3x swap)

    cost_info = calculate_forex_trade_cost(
        pair="EURUSD",
        entry_time=entry_ts,
        exit_time=exit_ts,
        direction="long",
        session="overlap",
    )

    assert cost_info["effective_spread_pips"] == 1.0
    assert cost_info["spread_cost_pct"] == 0.0001
    assert cost_info["swap_cost_pct"] > 0.0
    assert cost_info["total_cost_pct"] > cost_info["spread_cost_pct"]


def test_get_bars_forex_integration():
    """Tests unified Data Lake get_bars API querying Forex Parquet files."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_path = Path(tmp_dir)

        # Download sample EURUSD history into temp directory
        download_forex_history(pairs=["EURUSD"], timeframe="15m", data_dir=tmp_path)

        # Query via get_bars
        df_bars = get_bars("EURUSD", "15m", "2023-01-01", "2026-12-31", data_dir=tmp_path)

        assert not df_bars.empty
        assert "session" in df_bars.columns
        assert df_bars["pair"].iloc[0] == "EURUSD"
