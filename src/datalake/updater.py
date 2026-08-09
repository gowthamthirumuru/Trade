"""
Incremental Nightly Data Lake Updater Module.

Fetches recent missing candles for all pairs in the configured universe via CCXT (Binance REST API),
appends new bars to per-pair base 1m Parquet files, resamples higher timeframes, validates quality,
and updates DuckDB analytical views.

Context:
    Layer 1 (Data Lake) component specified in Master Plan §9.5 Item 2 & §C2.11.3.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional
import ccxt
import duckdb
import pandas as pd

from src.datalake.resample import resample_bars
from src.datalake.validate import validate_bars

logger = logging.getLogger(__name__)

CANONICAL_COLUMNS: List[str] = [
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


def fetch_recent_bars_ccxt(exchange: ccxt.binance, pair: str, timeframe: str = "1m", since_ms: Optional[int] = None, limit: int = 1000) -> pd.DataFrame:
    """Fetches missing OHLCV candles from Binance via CCXT REST interface.

    Args:
        exchange (ccxt.binance): CCXT Binance exchange instance.
        pair (str): Trading pair symbol (e.g. 'BTCUSDT').
        timeframe (str): Timeframe identifier ('1m'). Defaults to '1m'.
        since_ms (Optional[int]): Millisecond timestamp to fetch from.
        limit (int): Maximum number of bars per request (max 1000). Defaults to 1000.

    Returns:
        pd.DataFrame: Canonical bar DataFrame of fetched bars.
    """
    # CCXT symbol format uses slash (e.g., 'BTC/USDT')
    ccxt_symbol = pair if "/" in pair else pair.replace("USDT", "/USDT")
    logger.debug("Fetching CCXT bars for %s since %s", ccxt_symbol, since_ms)

    try:
        raw_ohlcv = exchange.fetch_ohlcv(symbol=ccxt_symbol, timeframe=timeframe, since=since_ms, limit=limit)
        if not raw_ohlcv:
            return pd.DataFrame(columns=CANONICAL_COLUMNS)

        df = pd.DataFrame(raw_ohlcv, columns=["open_time", "open", "high", "low", "close", "volume"])
        df["open_time"] = pd.to_datetime(df["open_time"], unit="ms", utc=True)
        df["quote_vol"] = df["volume"] * df["close"]  # Approximation for REST OHLCV
        df["trades"] = 0
        df["taker_buy"] = 0.0
        df["pair"] = pair
        df["timeframe"] = timeframe

        return df[CANONICAL_COLUMNS]

    except Exception as exc:
        logger.error("CCXT fetch failed for pair %s: %s", pair, exc)
        return pd.DataFrame(columns=CANONICAL_COLUMNS)


def update_pair_nightly(
    pair: str,
    output_dir: Path,
    exchange: Optional[ccxt.binance] = None,
    derived_timeframes: Optional[List[str]] = None,
) -> Dict[str, int]:
    """Appends recent bars for a single pair to local Parquet files in an idempotent manner.

    Args:
        pair (str): Trading pair identifier.
        output_dir (Path): Data Lake root directory.
        exchange (Optional[ccxt.binance]): CCXT exchange instance.
        derived_timeframes (Optional[List[str]]): List of higher timeframes to update.

    Returns:
        Dict[str, int]: Dictionary mapping timeframe to count of newly appended bars.
    """
    if derived_timeframes is None:
        derived_timeframes = ["5m", "15m", "1h", "4h", "1d"]

    exchange = exchange or ccxt.binance({"enableRateLimit": True})
    base_file = output_dir / "raw" / "binance" / pair / "1m.parquet"

    existing_df = pd.DataFrame(columns=CANONICAL_COLUMNS)
    last_timestamp_ms: Optional[int] = None

    if base_file.exists():
        existing_df = pd.read_parquet(base_file)
        if not existing_df.empty:
            last_dt = existing_df["open_time"].max()
            last_timestamp_ms = int(last_dt.timestamp() * 1000)

    # Fetch new bars starting 1ms after last stored bar
    since_ms = (last_timestamp_ms + 1) if last_timestamp_ms else None
    new_bars_df = fetch_recent_bars_ccxt(exchange, pair, timeframe="1m", since_ms=since_ms)

    if new_bars_df.empty:
        logger.info("Pair %s is up-to-date. 0 new bars inserted.", pair)
        return {tf: 0 for tf in ["1m"] + derived_timeframes}

    # Idempotent merge with existing bars
    combined_df = pd.concat([existing_df, new_bars_df], ignore_index=True)
    combined_df = combined_df.drop_duplicates(subset=["open_time"]).sort_values("open_time").reset_index(drop=True)

    # Validate quality
    clean_df, report = validate_bars(combined_df, pair, timeframe="1m")

    # Persist updated 1m base Parquet
    base_file.parent.mkdir(parents=True, exist_ok=True)
    clean_df.to_parquet(base_file, index=False, compression="snappy")

    inserted_count = len(clean_df) - len(existing_df)
    logger.info("Updated %s 1m history: %d new bars added (Total: %d)", pair, inserted_count, len(clean_df))

    # Regenerate derived timeframes
    results = {"1m": inserted_count}
    for tf in derived_timeframes:
        resampled_df = resample_bars(clean_df, target_timeframe=tf)
        tf_file = output_dir / "raw" / "binance" / pair / f"{tf}.parquet"
        resampled_df.to_parquet(tf_file, index=False, compression="snappy")
        results[tf] = len(resampled_df)

    return results
