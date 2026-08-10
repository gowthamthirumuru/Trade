"""
Validation Lab Access API Layer.

Official contract function `run_gauntlet()` used by downstream modules and UI command center
to execute candidate validation gauntlet (§C2.5).

Context:
    Layer 7 (Validation Lab) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from src.validation.gauntlet import run_gauntlet as internal_run_gauntlet

logger = logging.getLogger(__name__)


def run_gauntlet(
    strategy: str,
    run_id: str,
    db_path: Optional[Path] = None,
    n_variants_override: Optional[int] = None,
    trades_df: Optional[pd.DataFrame] = None,
) -> Dict[str, Any]:
    """Executes the full 6-gate Validation Lab gauntlet on target strategy (§C2.5).

    Args:
        strategy (str): Strategy identifier string.
        run_id (str): Backtest/mining run identifier string.
        db_path (Optional[Path]): DuckDB database path override.
        n_variants_override (Optional[int]): Miner trial variant count override.
        trades_df (Optional[pd.DataFrame]): Trade log DataFrame override.

    Returns:
        Dict[str, Any]: Validation Gauntlet results and verdict dictionary.
    """
    return internal_run_gauntlet(
        strategy,
        run_id,
        db_path=db_path,
        n_variants_override=n_variants_override,
        trades_df=trades_df,
    )
