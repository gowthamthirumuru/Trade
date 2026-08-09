"""
Feature Factory Access API Layer.

Official contract function `get_features()` used by downstream modules (Miner, Backtester, Edge Analytics)
to load materialized feature data joinable on `open_time`.

Context:
    Layer 2 (Feature Factory) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Optional
import duckdb
import pandas as pd

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def get_features(
    pair: str,
    tf: str,
    start: str,
    end: str,
    version: str = "latest",
    data_dir: Optional[Path] = None,
) -> pd.DataFrame:
    """Fetches a UTC-indexed feature DataFrame from `.features.parquet` joinable on `open_time`.

    Args:
        pair (str): Trading pair symbol (e.g., 'BTCUSDT').
        tf (str): Timeframe symbol (e.g., '1m', '15m', '1h').
        start (str): Start timestamp string (inclusive, UTC).
        end (str): End timestamp string (inclusive, UTC).
        version (str): Feature version filter (or 'latest'). Defaults to 'latest'.
        data_dir (Optional[Path]): Data directory override for testing.

    Returns:
        pd.DataFrame: UTC-indexed feature DataFrame joinable on `open_time`.
    """
    root = get_project_root()
    base_data_dir = data_dir or (root / "data")
    features_file = base_data_dir / "features" / pair / f"{tf}.features.parquet"

    if not features_file.exists():
        logger.warning("Feature file missing for %s %s at %s", pair, tf, features_file)
        return pd.DataFrame()

    start_ts = pd.Timestamp(start).tz_localize("UTC" if pd.Timestamp(start).tzinfo is None else None).isoformat()
    end_ts = pd.Timestamp(end).tz_localize("UTC" if pd.Timestamp(end).tzinfo is None else None).isoformat()

    query = """
        SELECT *
        FROM read_parquet(?)
        WHERE open_time >= CAST(? AS TIMESTAMPTZ)
          AND open_time <= CAST(? AS TIMESTAMPTZ)
        ORDER BY open_time ASC
    """

    con = duckdb.connect(database=":memory:")
    df = con.execute(query, [str(features_file), start_ts, end_ts]).df()
    con.close()

    if not df.empty and not isinstance(df["open_time"].dtype, pd.DatetimeTZDtype):
        df["open_time"] = pd.to_datetime(df["open_time"], utc=True)

    return df
