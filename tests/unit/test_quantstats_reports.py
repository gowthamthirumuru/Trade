"""
Unit Test Suite for QuantStats Reporting Engine.

Tests tear sheet metric calculation, html report generation, and fallback handling.
"""

from pathlib import Path
import tempfile

import numpy as np
import pandas as pd
import pytest

from src.monitoring.quantstats_reports import generate_quantstats_tear_sheet


def test_generate_quantstats_tear_sheet_execution():
    """Verifies metrics calculation and HTML tear sheet file generation."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_out = Path(tmp_dir) / "reports"

        ts = pd.date_range("2023-01-01", periods=60, freq="1D", tz="UTC")
        np.random.seed(42)
        rets = pd.Series(np.random.normal(0.002, 0.01, size=60), index=ts)

        report = generate_quantstats_tear_sheet(
            returns_series=rets,
            strategy="test_strat",
            output_dir=tmp_out,
        )

        assert report["status"] == "SUCCESS"
        assert report["n_observations"] == 60
        assert report["sharpe_ratio"] > 0.0
        assert Path(report["html_report_path"]).exists()
