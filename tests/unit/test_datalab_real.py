"""Unit tests for 100% Real Parquet & DuckDB Data Lab functionality (BTCUSDT Focused)."""

import pytest
from pathlib import Path
from fastapi.testclient import TestClient

from src.ui.server.main import app
from src.ui.server.services.live_data_engine import LiveDataEngine


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


@pytest.fixture
def engine():
    """LiveDataEngine instance fixture."""
    return LiveDataEngine()


def test_datalab_summary_btcusdt(engine):
    """Test that data lake summary returns authentic scanned BTCUSDT partitions from disk."""
    summary = engine.get_real_data_lake_summary()
    assert "instruments" in summary
    assert "total_candles" in summary
    assert "total_storage_mb" in summary
    assert "total_lake_candles" in summary

    instruments = summary["instruments"]
    assert len(instruments) >= 1, f"Expected BTCUSDT instrument, got {len(instruments)}"

    pairs = [i["pair"] for i in instruments]
    assert "BTCUSDT" in pairs

    btc_inst = next(i for i in instruments if i["pair"] == "BTCUSDT")
    assert btc_inst["candles"] > 0
    assert btc_inst["size_mb"] > 0
    assert btc_inst["quality"] >= 95.0
    assert btc_inst["status"] == "HEALTHY"
    assert "1m" in btc_inst["timeframe"]
    assert summary["total_lake_candles"] > 3_000_000, f"Expected >3M bars, got {summary['total_lake_candles']}"


def test_datalab_real_candles_btcusdt_1m(engine):
    """Test that BTCUSDT 1m candles are real market prices and satisfy OHLC invariants."""
    candles = engine.get_real_candles("BTCUSDT", "1m", limit=5000)
    assert len(candles) == 5000, f"Expected 5000 candles, got {len(candles)}"

    for bar in candles[:100]:
        assert "time" in bar
        assert "open" in bar
        assert "high" in bar
        assert "low" in bar
        assert "close" in bar
        assert "volume" in bar

        o, h, l, c, v = bar["open"], bar["high"], bar["low"], bar["close"], bar["volume"]
        # Real BTC price check
        assert o > 1000.0, f"Unexpected fake price: {o}"
        assert c > 1000.0, f"Unexpected fake price: {c}"
        # Invariants: High is >= max(O, C) and Low <= min(O, C)
        assert h >= max(o, c) - 0.01, f"High {h} is not >= max({o}, {c})"
        assert l <= min(o, c) + 0.01, f"Low {l} is not <= min({o}, {c})"
        assert v >= 0, f"Volume {v} is negative"


def test_datalab_real_candles_btcusdt_multi_timeframe(engine):
    """Test that BTCUSDT derived timeframes (5m, 15m, 1h, 4h, 1d) are queryable."""
    for tf in ["5m", "15m", "1h", "4h", "1d"]:
        candles = engine.get_real_candles("BTCUSDT", tf, limit=50)
        assert len(candles) == 50, f"Expected 50 candles for {tf}, got {len(candles)}"
        for bar in candles:
            assert bar["open"] > 1000.0
            assert bar["high"] >= bar["low"]


def test_datalab_real_gap_audit(engine):
    """Test that the gap audit scans actual parquet files and returns completeness."""
    audit = engine.get_real_gap_audit("BTCUSDT", "15m")
    assert audit["pair"] == "BTCUSDT"
    assert audit["timeframe"] == "15m"
    assert audit["total_bars"] > 100000
    assert audit["completeness_pct"] >= 90.0
    assert isinstance(audit["anomalies"], list)


def test_datalab_api_endpoints(client):
    """Test HTTP API endpoints for Data Lab."""
    # 1. Summary
    res_summary = client.get("/api/v1/research/datalab/summary")
    assert res_summary.status_code == 200
    data_sum = res_summary.json()
    assert "instruments" in data_sum
    assert any(i["pair"] == "BTCUSDT" for i in data_sum["instruments"])

    # 2. 1m Candles with 5,000 limit
    res_candles = client.get("/api/v1/research/datalab/candles?pair=BTCUSDT&timeframe=1m&limit=5000")
    assert res_candles.status_code == 200
    data_cand = res_candles.json()
    assert data_cand["pair"] == "BTCUSDT"
    assert data_cand["timeframe"] == "1m"
    assert data_cand["count"] == 5000
    assert len(data_cand["candles"]) == 5000

    # 3. Gap Audit
    res_audit = client.get("/api/v1/research/datalab/gap-audit?pair=BTCUSDT&timeframe=15m")
    assert res_audit.status_code == 200
    data_aud = res_audit.json()
    assert data_aud["pair"] == "BTCUSDT"
    assert data_aud["total_bars"] > 100000
