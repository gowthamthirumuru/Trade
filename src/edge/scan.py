"""
Dimension Scanner & Cross-Tabulation Heatmap Module.

Iterates over dimensional slices (hour, day, session, trend regime, vol regime) to discover
statistically distinct trading windows (§14.2).

Context:
    Layer 6 (Edge Analytics Engine) dimension scanner specified in Master Plan §14.2.
"""

import logging
from typing import Any, Dict, List, Optional
import pandas as pd

from src.edge.slice import slice_stats

logger = logging.getLogger(__name__)


def scan_dimensions(
    trades_df: pd.DataFrame,
    dims: List[str],
    min_n: int = 10,
) -> pd.DataFrame:
    """Scans multi-dimensional trade slices and computes statistics per cell (§14.2).

    Args:
        trades_df (pd.DataFrame): Input trade log DataFrame.
        dims (List[str]): Grouping dimension column names (e.g. ['hour_utc', 'day_of_week']).
        min_n (int): Minimum trades required per slice cell. Defaults to 10.

    Returns:
        pd.DataFrame: Table of slice scan results sorted by p_value.
    """
    if trades_df.empty or not dims:
        return pd.DataFrame()

    valid_dims = [d for d in dims if d in trades_df.columns]
    if not valid_dims:
        logger.warning("None of requested scan dimensions %s exist in trades DataFrame", dims)
        return pd.DataFrame()

    results: List[Dict[str, Any]] = []

    grouped = trades_df.groupby(valid_dims, observed=True)
    for key, group in grouped:
        stats = slice_stats(group, min_n=min_n)
        if stats["n"] < min_n:
            continue

        row: Dict[str, Any] = {}
        if isinstance(key, tuple):
            for idx, dim in enumerate(valid_dims):
                row[dim] = key[idx]
        else:
            row[valid_dims[0]] = key

        row.update(stats)
        results.append(row)

    if not results:
        return pd.DataFrame()

    df_results = pd.DataFrame(results)
    return df_results.sort_values("p_value").reset_index(drop=True)


def generate_heatmap_pivot(
    trades_df: pd.DataFrame,
    dim_x: str,
    dim_y: str,
    metric: str = "expectancy_r",
    min_n: int = 5,
) -> pd.DataFrame:
    """Generates 2D pivot table (heatmap matrix) for specified dimension pair (§14.2 & A6.2).

    Args:
        trades_df (pd.DataFrame): Trade log DataFrame.
        dim_x (str): X-axis dimension (e.g. 'hour_utc').
        dim_y (str): Y-axis dimension (e.g. 'day_of_week').
        metric (str): Performance metric to compute ('expectancy_r', 'win_rate', 'n').
        min_n (int): Minimum required cell count. Defaults to 5.

    Returns:
        pd.DataFrame: 2D pivot table matrix.
    """
    if trades_df.empty or dim_x not in trades_df.columns or dim_y not in trades_df.columns:
        return pd.DataFrame()

    scan_res = scan_dimensions(trades_df, [dim_y, dim_x], min_n=min_n)
    if scan_res.empty or metric not in scan_res.columns:
        return pd.DataFrame()

    pivot = scan_res.pivot(index=dim_y, columns=dim_x, values=metric)
    return pivot.fillna(0.0)
