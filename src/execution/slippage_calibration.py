"""
Slippage & Fill Calibration Engine Module.

Calculates measured live/testnet slippage distributions vs alert-time mid prices and generates calibration reports
as mandated by Master Plan §19.3 & §19.4.

Context:
    Layer 11 (Execution & Live Loop) slippage calibration specified in Master Plan §19.3 & §19.4.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import numpy as np
import pandas as pd

from src.tradesdb.api import query
from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def calibrate_slippage(
    trades_df: Optional[pd.DataFrame] = None,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Generates monthly slippage calibration metrics and report (§19.3 & A11.6).

    Args:
        trades_df (Optional[pd.DataFrame]): Trade log DataFrame override.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Slippage calibration report dictionary.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")

    if trades_df is None or trades_df.empty:
        initialize_duckdb_schema(db_path=target_db)
        try:
            df = query("SELECT * FROM trades WHERE source IN ('live', 'testnet')", db_path=target_db)
        except Exception:
            df = pd.DataFrame()
    else:
        df = trades_df.copy()

    if df.empty or "slippage" not in df.columns:
        # Default baseline if no live trades logged yet
        return {
            "status": "BASELINE_DEFAULT",
            "mean_slippage_bps": 2.0,
            "p95_slippage_bps": 5.0,
            "sample_size": 0,
            "recommended_backtest_slippage_bps": 2.0,
        }

    slip_arr = df["slippage"].dropna().values.astype(float)
    if len(slip_arr) == 0:
        return {
            "status": "BASELINE_DEFAULT",
            "mean_slippage_bps": 2.0,
            "p95_slippage_bps": 5.0,
            "sample_size": 0,
            "recommended_backtest_slippage_bps": 2.0,
        }

    mean_slip = float(np.mean(slip_arr))
    p95_slip = float(np.percentile(slip_arr, 95))
    recommended_slip = max(2.0, float(np.ceil(p95_slip)))

    logger.info("Calibrated Slippage: mean=%.2fbps, p95=%.2fbps, recommended=%.2fbps (n=%d)", mean_slip, p95_slip, recommended_slip, len(slip_arr))
    return {
        "status": "CALIBRATED",
        "mean_slippage_bps": round(mean_slip, 2),
        "p95_slippage_bps": round(p95_slip, 2),
        "sample_size": len(slip_arr),
        "recommended_backtest_slippage_bps": recommended_slip,
    }
