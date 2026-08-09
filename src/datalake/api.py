"""
Data Lake Access API & Contract Layer.

The ONLY official import that downstream modules (Feature Factory, Miner, Backtester, Edge Analytics)
use to query market data. Implements DuckDB pushdown queries over snappy Parquet storage.

Context:
    Layer 1 (Data Lake) public contract specified in Master Plan §9.5 Item 5 & §C2.5.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional
import duckdb
import pandas as pd
import yaml

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def load_system_config() -> dict:
    """Loads system.yaml configuration."""
    config_path = get_project_root() / "config" / "system.yaml"
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def get_bars(pair: str, tf: str, start: str, end: str, data_dir: Optional[Path] = None) -> pd.DataFrame:
    """Fetches a UTC-indexed OHLCV+ DataFrame from Parquet via DuckDB pushdown query.

    Args:
        pair (str): Trading pair symbol (e.g. 'BTCUSDT').
        tf (str): Timeframe identifier ('1m', '5m', '15m', '1h', '4h', '1d').
        start (str): Start date/time string (inclusive, UTC).
        end (str): End date/time string (inclusive, UTC).
        data_dir (Optional[Path]): Data directory override for testing.

    Returns:
        pd.DataFrame: UTC-indexed pandas DataFrame in canonical bar schema.
    """
    root = get_project_root()
    data_path = data_dir or (root / "data")
    parquet_file = data_path / "raw" / "binance" / pair / f"{tf}.parquet"

    if not parquet_file.exists():
        logger.warning("Parquet file not found for pair %s tf %s at %s", pair, tf, parquet_file)
        return pd.DataFrame(columns=[
            "open_time", "open", "high", "low", "close", "volume", "quote_vol", "trades", "taker_buy", "pair", "timeframe"
        ])

    start_ts = pd.Timestamp(start).tz_localize("UTC" if pd.Timestamp(start).tzinfo is None else None).isoformat()
    end_ts = pd.Timestamp(end).tz_localize("UTC" if pd.Timestamp(end).tzinfo is None else None).isoformat()

    # Execute high-performance DuckDB SQL query directly over Parquet file
    query = """
        SELECT 
            open_time, open, high, low, close, volume, quote_vol, trades, taker_buy, pair, timeframe
        FROM read_parquet(?)
        WHERE open_time >= CAST(? AS TIMESTAMPTZ)
          AND open_time <= CAST(? AS TIMESTAMPTZ)
        ORDER BY open_time ASC
    """

    con = duckdb.connect(database=":memory:")
    df = con.execute(query, [str(parquet_file), start_ts, end_ts]).df()
    con.close()

    if not df.empty and not isinstance(df["open_time"].dtype, pd.DatetimeTZDtype):
        df["open_time"] = pd.to_datetime(df["open_time"], utc=True)

    return df


def get_events(start: str, end: str, data_dir: Optional[Path] = None) -> pd.DataFrame:
    """Reads macro event calendar events between start and end dates.

    Args:
        start (str): Start date string.
        end (str): End date string.
        data_dir (Optional[Path]): Data directory override.

    Returns:
        pd.DataFrame: Filtered events DataFrame.
    """
    root = get_project_root()
    data_path = data_dir or (root / "data")
    events_csv = data_path / "calendar" / "events.csv"

    if not events_csv.exists():
        return pd.DataFrame(columns=["event_date", "event_time_utc", "event_name", "category", "impact"])

    df = pd.read_csv(events_csv)
    df["event_timestamp"] = pd.to_datetime(df["event_date"] + " " + df["event_time_utc"], utc=True)

    start_ts = pd.Timestamp(start, tz="UTC")
    end_ts = pd.Timestamp(end, tz="UTC")

    mask = (df["event_timestamp"] >= start_ts) & (df["event_timestamp"] <= end_ts)
    return df[mask].sort_values("event_timestamp").reset_index(drop=True)


def data_quality_report(pair: Optional[str] = None, data_dir: Optional[Path] = None) -> Dict[str, str]:
    """Reads latest data quality report markdown or log summary.

    Args:
        pair (Optional[str]): Pair filter option.
        data_dir (Optional[Path]): Data directory override.

    Returns:
        Dict[str, str]: Summary report dict.
    """
    root = get_project_root()
    data_path = data_dir or (root / "data")
    report_file = data_path / "data_quality_report.md"

    if not report_file.exists():
        return {"status": "NO_REPORT", "content": "No data quality report has been generated yet."}

    content = report_file.read_text(encoding="utf-8")
    return {"status": "OK", "content": content}


def register_duckdb_views(con: duckdb.DuckDBPyConnection, data_dir: Optional[Path] = None) -> None:
    """Registers DuckDB SQL views (`v_bars_1m`, `v_bars_5m`, `v_bars_1h`, etc.) over all raw Parquet files.

    Args:
        con (duckdb.DuckDBPyConnection): Active DuckDB connection.
        data_dir (Optional[Path]): Data directory override.
    """
    root = get_project_root()
    data_path = data_dir or (root / "data")
    timeframes = ["1m", "5m", "15m", "1h", "4h", "1d"]

    for tf in timeframes:
        glob_pattern = str(data_path / "raw" / "binance" / "*" / f"{tf}.parquet").replace("\\", "/")
        view_name = f"v_bars_{tf}"
        view_sql = f"""
            CREATE OR REPLACE VIEW {view_name} AS 
            SELECT * FROM read_parquet('{glob_pattern}')
        """
        try:
            con.execute(view_sql)
            logger.debug("Registered DuckDB view %s for pattern %s", view_name, glob_pattern)
        except Exception as exc:
            logger.warning("Could not register view %s (no parquet files matching %s): %s", view_name, glob_pattern, exc)
