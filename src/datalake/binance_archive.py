"""
Binance Public Data Archive Bulk Downloader.

Downloads historical 1m kline data from Binance public data archive (data.binance.vision),
parses monthly ZIP archives in memory, formats the data into the APEX canonical bar schema,
and persists snappy-compressed Parquet files locally in a resume-safe manner.

Context:
    Layer 1 (Data Lake) component specified in Master Plan §9.5 Item 1 & §C2.11.1.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
import io
import logging
from pathlib import Path
from typing import List, Optional
import zipfile

import pandas as pd
import requests

logger = logging.getLogger(__name__)

# Binance public archive base URL for monthly kline ZIPs
BINANCE_ARCHIVE_BASE_URL: str = "https://data.binance.vision/data/spot/monthly/klines"

# Raw columns present in Binance kline CSV archives
BINANCE_CSV_COLUMNS: List[str] = [
    "open_time",
    "open",
    "high",
    "low",
    "close",
    "volume",
    "close_time",
    "quote_vol",
    "trades",
    "taker_buy",
    "taker_buy_q",
    "ignore",
]

# APEX Canonical Bar Schema columns (§9.4)
CANONICAL_BAR_COLUMNS: List[str] = [
    "open_time",
    "open",
    "high",
    "low",
    "close",
    "volume",
    "quote_vol",
    "trades",
    "taker_buy",
    "pair",
    "timeframe",
]


def months_between(start_date: str, end_date: str) -> List[str]:
    """Generates a list of year-month string formatted dates ('YYYY-MM') between start and end.

    Args:
        start_date (str): Start date string (e.g., '2017-08-01').
        end_date (str): End date string (e.g., '2023-12-31').

    Returns:
        List[str]: List of year-month strings (e.g., ['2017-08', '2017-09', ...]).
    """
    period_range = pd.period_range(start=start_date, end=end_date, freq="M")
    return [str(period.date())[:7] for period in period_range]


def fetch_month(pair: str, timeframe: str, year_month: str, timeout: int = 60) -> Optional[pd.DataFrame]:
    """Downloads and parses a single month's kline ZIP file from Binance public archive.

    Args:
        pair (str): Trading pair identifier (e.g., 'BTCUSDT').
        timeframe (str): Kline timeframe (e.g., '1m').
        year_month (str): Target month in 'YYYY-MM' format.
        timeout (int): HTTP request timeout in seconds. Defaults to 60.

    Returns:
        Optional[pd.DataFrame]: Standardized DataFrame with canonical bar schema, or None if pair was not listed.
    """
    archive_url = f"{BINANCE_ARCHIVE_BASE_URL}/{pair}/{timeframe}/{pair}-{timeframe}-{year_month}.zip"
    logger.info("Fetching archive: %s", archive_url)

    try:
        response = requests.get(archive_url, timeout=timeout)
        if response.status_code == 404:
            logger.debug("Pair %s not listed yet for month %s (404)", pair, year_month)
            return None
        response.raise_for_status()

        # Unzip in-memory stream to extract raw CSV content
        with zipfile.ZipFile(io.BytesIO(response.content)) as zip_file:
            csv_filenames = zip_file.namelist()
            if not csv_filenames:
                logger.warning("Empty ZIP archive received for %s %s", pair, year_month)
                return None

            with zip_file.open(csv_filenames[0]) as csv_file:
                df = pd.read_csv(csv_file, header=None, names=BINANCE_CSV_COLUMNS)

        # Standardize UTC timestamp indexing (Binance open_time is in milliseconds)
        df["open_time"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)

        # Ensure numeric type precision
        numeric_cols = ["open", "high", "low", "close", "volume", "quote_vol", "taker_buy"]
        for col in numeric_cols:
            df[col] = df[col].astype(float)
        df["trades"] = df["trades"].astype(int)

        # Add domain metadata labels
        df["pair"] = pair
        df["timeframe"] = timeframe

        # Retain canonical columns strictly in order
        return df[CANONICAL_BAR_COLUMNS]

    except Exception as exc:
        logger.error("Failed downloading/parsing archive for %s %s: %s", pair, year_month, exc)
        return None


def get_fragment_path(output_directory: Path, pair: str, timeframe: str, year_month: str) -> Path:
    """Returns the expected file path for a single monthly Parquet fragment cache.

    Args:
        output_directory (Path): Root directory for local data lake storage.
        pair (str): Trading pair identifier.
        timeframe (str): Timeframe identifier.
        year_month (str): Year-month string ('YYYY-MM').

    Returns:
        Path: Absolute path to the cached fragment file.
    """
    return output_directory / "fragments" / pair / timeframe / f"{pair}_{timeframe}_{year_month}.parquet"


def is_month_cached(output_directory: Path, pair: str, timeframe: str, year_month: str) -> bool:
    """Checks whether a monthly Parquet fragment is already cached locally.

    Args:
        output_directory (Path): Data Lake root directory.
        pair (str): Trading pair identifier.
        timeframe (str): Timeframe identifier.
        year_month (str): Year-month string ('YYYY-MM').

    Returns:
        bool: True if cached fragment exists and is non-empty.
    """
    fragment_path = get_fragment_path(output_directory, pair, timeframe, year_month)
    return fragment_path.exists() and fragment_path.stat().st_size > 0


def cache_month(output_directory: Path, pair: str, timeframe: str, year_month: str, df: pd.DataFrame) -> Path:
    """Persists a parsed monthly bar DataFrame into a local snappy Parquet fragment cache.

    Args:
        output_directory (Path): Data Lake root directory.
        pair (str): Trading pair identifier.
        timeframe (str): Timeframe identifier.
        year_month (str): Year-month string.
        df (pd.DataFrame): Formatted DataFrame to store.

    Returns:
        Path: Path to saved fragment file.
    """
    fragment_path = get_fragment_path(output_directory, pair, timeframe, year_month)
    fragment_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(fragment_path, index=False, compression="snappy")
    logger.debug("Cached monthly fragment to %s", fragment_path)
    return fragment_path


def consolidate_pair_history(output_directory: Path, pair: str, timeframe: str) -> Path:
    """Consolidates all cached monthly fragment files into a unified per-pair/timeframe Parquet file.

    Args:
        output_directory (Path): Data Lake root directory.
        pair (str): Trading pair identifier.
        timeframe (str): Timeframe identifier.

    Returns:
        Path: Path to consolidated Parquet file.
    """
    fragment_dir = output_directory / "fragments" / pair / timeframe
    fragment_files = sorted(fragment_dir.glob("*.parquet"))

    if not fragment_files:
        raise FileNotFoundError(f"No fragment files found for pair {pair} timeframe {timeframe} under {fragment_dir}")

    frames = [pd.read_parquet(file) for file in fragment_files]
    consolidated_df = pd.concat(frames, ignore_index=True)

    # Enforce uniqueness on open_time and sort chronologically
    consolidated_df = consolidated_df.drop_duplicates(subset=["open_time"]).sort_values("open_time").reset_index(drop=True)

    target_file = output_directory / "raw" / "binance" / pair / f"{timeframe}.parquet"
    target_file.parent.mkdir(parents=True, exist_ok=True)
    consolidated_df.to_parquet(target_file, index=False, compression="snappy")
    logger.info("Consolidated %d total bars for %s (%s) to %s", len(consolidated_df), pair, timeframe, target_file)
    return target_file


def ingest_pair(
    pair: str,
    timeframe: str,
    start_date: str,
    end_date: str,
    output_directory: Path,
    max_workers: int = 4,
) -> Path:
    """Executes full resume-safe bulk ingestion for a single pair and timeframe across date range.

    Args:
        pair (str): Trading pair symbol (e.g., 'BTCUSDT').
        timeframe (str): Base timeframe (typically '1m').
        start_date (str): Start date ('YYYY-MM-DD').
        end_date (str): End date ('YYYY-MM-DD').
        output_directory (Path): Root data directory (e.g., Path('data')).
        max_workers (int): Thread concurrency for downloading. Defaults to 4.

    Returns:
        Path: Path to consolidated per-pair base Parquet file.
    """
    target_months = months_between(start_date, end_date)
    missing_months = [ym for ym in target_months if not is_month_cached(output_directory, pair, timeframe, ym)]

    logger.info("Ingesting %s %s: %d total months, %d to download", pair, timeframe, len(target_months), len(missing_months))

    if missing_months:
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_ym = {
                executor.submit(fetch_month, pair, timeframe, ym): ym for ym in missing_months
            }
            for future in as_completed(future_to_ym):
                ym = future_to_ym[future]
                try:
                    df = future.result()
                    if df is not None and not df.empty:
                        cache_month(output_directory, pair, timeframe, ym, df)
                except Exception as exc:
                    logger.error("Exception during download task for %s %s %s: %s", pair, timeframe, ym, exc)

    return consolidate_pair_history(output_directory, pair, timeframe)
