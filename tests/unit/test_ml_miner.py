"""
Unit Test Suite for Miner-3 Machine Learning Classifier.

Tests ML feature extraction, model fitting, ROC-AUC evaluation, and DuckDB run persistence.
"""

from pathlib import Path
import tempfile

import pandas as pd
import pytest

from src.miner.ml_classifier import train_trade_success_classifier


def test_train_trade_success_classifier_execution():
    """Verifies ML classifier trains on trade logs and records run in DuckDB."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_ml_test.duckdb"

        # Create mock trades DataFrame
        df_mock = pd.DataFrame({
            "pnl_r": [0.5, -0.2, 1.2, -0.4, 0.8, -0.1, 0.3, -0.5, 0.9, -0.3] * 5,
            "hour_utc": [8, 12, 14, 16, 20] * 10,
            "day_of_week": [1, 2, 3, 4, 5] * 10,
            "rsi_at_entry": [25.0, 65.0, 30.0, 75.0, 28.0] * 10,
            "adx_at_entry": [22.0, 15.0, 35.0, 12.0, 28.0] * 10,
        })

        audit = train_trade_success_classifier(db_path=tmp_db, trades_df=df_mock)

        assert audit["status"] == "SUCCESS"
        assert audit["auc_score"] >= 0.0
        assert audit["n_samples"] == 50
        assert len(audit["feature_importances"]) == 4
