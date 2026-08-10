"""
Unit Test Suite for CCXT Live Data Ingestion Module.

Tests CCXT data fetching, validation, Parquet lake persistence, and DuckDB view updates.
"""

from pathlib import Path
import tempfile

import pytest

from src.datalake.ccxt_updater import fetch_ccxt_ohlcv, update_live_market_data


def test_fetch_ccxt_ohlcv_structure():
    """Verifies fetched OHLCV DataFrame schema, types, and timestamp index."""
    df = fetch_ccxt_ohlcv(symbol="ETHUSDT", timeframe="15m", limit=50)

    assert not df.empty
    assert len(df) == 50
    assert list(df.columns) == ["open", "high", "low", "close", "volume"]
    assert str(df.index.tz) == "UTC"


def test_update_live_market_data_idempotency():
    """Verifies update_live_market_data stores Parquet files and creates DuckDB view."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_test.duckdb"
        tmp_parquet = Path(tmp_dir) / "parquet"

        res1 = update_live_market_data(
            symbol="BTCUSDT",
            timeframe="15m",
            db_path=tmp_db,
            parquet_root=tmp_parquet,
        )

        assert res1["status"] == "SUCCESS"
        assert res1["bars_fetched"] == 100
        assert Path(res1["parquet_path"]).exists()

        # Re-run idempotently
        res2 = update_live_market_data(
            symbol="BTCUSDT",
            timeframe="15m",
            db_path=tmp_db,
            parquet_root=tmp_parquet,
        )
        assert res2["status"] == "SUCCESS"
