"""
Miner-3: Machine Learning & Gradient Boosting Feature Mine Module.

Trains local LightGBM / Scikit-Learn Gradient Boosting trade-success classifiers on 30+ DuckDB trade labels,
computes win probabilities P(win | features) and feature importances to discover statistical market edges
as mandated by Master Plan §11.5 & §C2.3.

Context:
    Layer 3 (Strategy Miner) Miner-3 component specified in Master Plan §11.5 & §C2.3.
"""

import json
import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional, Tuple

import duckdb
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

import sys

PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.tradesdb.api import query
from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def train_trade_success_classifier(
    strategy: Optional[str] = None,
    db_path: Optional[Path] = None,
    trades_df: Optional[pd.DataFrame] = None,
) -> Dict[str, Any]:
    """Trains a LightGBM / Gradient Boosting model to predict trade win probability (§11.5).

    Args:
        strategy (Optional[str]): Target strategy filter string.
        db_path (Optional[Path]): DuckDB database path override.
        trades_df (Optional[pd.DataFrame]): Trade history DataFrame override.

    Returns:
        Dict[str, Any]: Model training audit dictionary (AUC score, feature importances, status).
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    # Load trades
    if trades_df is None or trades_df.empty:
        if strategy:
            df_raw = query("SELECT * FROM trades WHERE strategy = ?", [strategy], db_path=target_db)
        else:
            df_raw = query("SELECT * FROM trades", db_path=target_db)
    else:
        df_raw = trades_df.copy()

    if df_raw.empty:
        logger.warning("No trade history found in DuckDB trades table. Cannot train ML trade classifier.")
        return {"status": "FAILED", "reason": "NO_TRADES_IN_DB"}

    # Prepare features and binary target y = (pnl_r > 0)
    df = df_raw.copy()
    df["target_win"] = (df["pnl_r"] > 0.0).astype(int)

    # Feature extraction from trade attributes & session/regime labels (excluding target & outcome leakages)
    leakage_cols = ["pnl_r", "pnl_pct", "pnl_quote", "fees", "slippage", "trade_id", "entry_price", "exit_price", "mae_pct", "mfe_pct", "bars_held", "target_win"]
    feature_cols = [c for c in df.columns if c not in leakage_cols and pd.api.types.is_numeric_dtype(df[c])]

    if "session" in df.columns and "session_code" not in feature_cols:
        df["session_code"] = pd.factorize(df["session"])[0]
        feature_cols.append("session_code")
    if "trend_regime" in df.columns and "trend_code" not in feature_cols:
        df["trend_code"] = pd.factorize(df["trend_regime"])[0]
        feature_cols.append("trend_code")
    if "vol_regime" in df.columns and "vol_code" not in feature_cols:
        df["vol_code"] = pd.factorize(df["vol_regime"])[0]
        feature_cols.append("vol_code")

    if not feature_cols:
        logger.error("No valid numeric feature columns available for ML classifier.")
        return {"status": "FAILED", "reason": "NO_FEATURES"}

    X = df[feature_cols].fillna(0.0)
    y = df["target_win"]

    if len(y.unique()) < 2:
        return {"status": "FAILED", "reason": "SINGLE_CLASS_TARGET"}

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

    # Use LightGBM if installed, fallback to GradientBoostingClassifier
    try:
        from lightgbm import LGBMClassifier

        model = LGBMClassifier(n_estimators=50, max_depth=3, random_state=42, verbose=-1)
        model.fit(X_train, y_train)
        model_type = "LightGBM"
    except Exception as exc:
        logger.info("LightGBM fallback activated (%s): using sklearn GradientBoostingClassifier.", exc)
        model = GradientBoostingClassifier(n_estimators=50, max_depth=3, random_state=42)
        model.fit(X_train, y_train)
        model_type = "GradientBoosting"

    y_pred_proba = np.asarray(model.predict_proba(X_test))[:, 1]
    auc_score = float(roc_auc_score(y_test, y_pred_proba))

    feature_importances = {
        feature_cols[i]: round(float(model.feature_importances_[i]), 4) for i in range(len(feature_cols))
    }

    # Log ML mining run to DuckDB
    run_id = f"run_ml_miner_{int(time.time())}"
    con = duckdb.connect(str(target_db))
    con.execute(
        """
        INSERT INTO runs (run_id, created_at, kind, strategy, params_json, pair, timeframe, data_start, data_end, cost_config, git_commit, seed, n_variants, metrics_json, status)
        VALUES (?, CURRENT_TIMESTAMP, 'miner3_ml', ?, ?, 'BTCUSDT', '15m', '2017-01-01', '2022-12-31', 'cost_5bps', 'head', 42, ?, ?, 'screened')
        ON CONFLICT (run_id) DO NOTHING
        """,
        [
            run_id,
            f"ml_classifier_{strategy or 'all'}",
            json.dumps({"auc_score": auc_score, "feature_importances": feature_importances, "model_type": model_type}),
            len(df),
            json.dumps({"auc_score": auc_score, "n_samples": len(df), "model_type": model_type}),
        ],
    )
    con.close()

    logger.info("Trained %s trade-success classifier: AUC=%.3f across %d features", model_type, auc_score, len(feature_cols))
    return {
        "status": "SUCCESS",
        "run_id": run_id,
        "model_type": model_type,
        "auc_score": auc_score,
        "n_samples": len(df),
        "feature_importances": feature_importances,
    }


if __name__ == "__main__":
    res = train_trade_success_classifier()
    print("ML Miner Audit:", res)
