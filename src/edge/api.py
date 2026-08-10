"""
Edge Analytics Engine Access API Layer.

Official contract functions `slice_stats()`, `scan_dimensions()`, and `make_edge_card()` used by downstream
modules and UI command center to execute edge analytics (§C2.5).

Context:
    Layer 6 (Edge Analytics Engine) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import pandas as pd

from src.edge.cards import make_edge_card as internal_make_edge_card
from src.edge.scan import scan_dimensions as internal_scan_dimensions
from src.edge.slice import slice_stats as internal_slice_stats
from src.tradesdb.api import query

logger = logging.getLogger(__name__)


def slice_stats(
    filter_dict: Optional[Union[Dict[str, Any], pd.DataFrame]] = None,
    trades_df: Optional[pd.DataFrame] = None,
    min_n: int = 10,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Calculates summary slice statistics for filtered trade subset (§C2.5).

    Supports both filter_dict signature and direct DataFrame evaluation.

    Args:
        filter_dict (Optional[Union[Dict[str, Any], pd.DataFrame]]): Filter dictionary or direct DataFrame.
        trades_df (Optional[pd.DataFrame]): Trade log DataFrame override.
        min_n (int): Minimum trade count threshold. Defaults to 10.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Slice statistics dictionary.
    """
    if isinstance(filter_dict, pd.DataFrame):
        trades_df = filter_dict
        filter_dict = None

    if trades_df is None or trades_df.empty:
        df_trades = query("SELECT * FROM trades", db_path=db_path)
    else:
        df_trades = trades_df.copy()

    filtered = df_trades.copy()
    if not filtered.empty and filter_dict and isinstance(filter_dict, dict):
        for col, val in filter_dict.items():
            if col in filtered.columns:
                if isinstance(val, list):
                    filtered = filtered[filtered[col].isin(val)]
                else:
                    filtered = filtered[filtered[col] == val]

    return internal_slice_stats(filtered, min_n=min_n)


def scan_dimensions(
    strategy: str,
    dims: List[str],
    trades_df: Optional[pd.DataFrame] = None,
    db_path: Optional[Path] = None,
) -> pd.DataFrame:
    """Scans requested dimensions for target strategy to discover edge windows (§C2.5).

    Args:
        strategy (str): Strategy identifier string.
        dims (List[str]): Grouping dimension column names (e.g. ['hour_utc', 'day_of_week']).
        trades_df (Optional[pd.DataFrame]): Trade log DataFrame override.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        pd.DataFrame: Dimension scan result set DataFrame.
    """
    if trades_df is None or trades_df.empty:
        df_trades = query("SELECT * FROM trades WHERE strategy = ?", {"1": strategy}, db_path=db_path)
    else:
        df_trades = trades_df[trades_df["strategy"] == strategy].copy() if "strategy" in trades_df.columns else trades_df.copy()

    return internal_scan_dimensions(df_trades, dims)


def make_edge_card(
    strategy: str,
    filter_dict: Dict[str, Any],
    trades_df: Optional[pd.DataFrame] = None,
    db_path: Optional[Path] = None,
) -> int:
    """Converts a validated slice into an active Edge Card and persists to DuckDB (§C2.5).

    Args:
        strategy (str): Strategy identifier string.
        filter_dict (Dict[str, Any]): Filter slice condition dictionary.
        trades_df (Optional[pd.DataFrame]): Trade log DataFrame override.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        int: Generated card_id integer.
    """
    return internal_make_edge_card(strategy, filter_dict, trades_df=trades_df, db_path=db_path)
