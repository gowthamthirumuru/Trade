"""High-Speed 5+ Year 1-Minute Ingestion Engine for BTCUSDT (Project APEX).

Streams all historical 1-minute monthly archives from Binance Vision (from 2017-08 to 2025-01)
directly in memory using multi-threaded workers, sanitizes headers and timestamp types,
saves institutional-grade Parquet partitions, and resamples all canonical timeframes.
Also permanently purges non-BTCUSDT partitions to specialize the data lake.
"""

import concurrent.futures
import io
import logging
import os
import shutil
from pathlib import Path
import time
import urllib.request
import zipfile
import numpy as np
import pandas as pd

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] apex.btcusdt_1m: %(message)s",
)
logger = logging.getLogger("apex.btcusdt_1m")

ROOT_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = ROOT_DIR / "data" / "raw"
BINANCE_DIR = RAW_DIR / "binance"
BTC_DIR = BINANCE_DIR / "BTCUSDT"
CACHE_DIR = ROOT_DIR / "data" / "cache_1m"

KLINE_COLS = [
    "open_time",
    "open",
    "high",
    "low",
    "close",
    "volume",
    "close_time",
    "quote_volume",
    "count",
    "taker_buy_volume",
    "taker_buy_quote_volume",
    "ignore",
]


def purge_other_pairs_permanently() -> None:
    """Permanently deletes all non-BTCUSDT raw data from disk."""
    logger.info("Purging non-BTCUSDT pairs from data lake per institutional directive...")
    
    # 1. Clean Dukascopy
    dukascopy_dir = RAW_DIR / "dukascopy"
    if dukascopy_dir.exists():
        shutil.rmtree(dukascopy_dir)
        logger.info("✓ Dukascopy forex directory removed.")

    # 2. Clean other Binance pairs
    if BINANCE_DIR.exists():
        for item in BINANCE_DIR.iterdir():
            if item.is_dir() and item.name != "BTCUSDT":
                shutil.rmtree(item)
                logger.info("✓ Removed pair: %s", item.name)


def fetch_and_parse_month(year: int, month: int) -> tuple[str, pd.DataFrame | None]:
    """Downloads and cleanly parses a single monthly 1m zip archive."""
    month_str = f"{year}-{month:02d}"
    cached_file = CACHE_DIR / f"BTCUSDT-1m-{month_str}.parquet"
    
    # Check if cached locally
    if cached_file.exists():
        try:
            df = pd.read_parquet(cached_file)
            return month_str, df
        except Exception:
            pass

    url = f"https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1m/BTCUSDT-1m-{month_str}.zip"
    
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "APEX-Quant-Institutional/2.0"},
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
            with zipfile.ZipFile(io.BytesIO(data)) as zf:
                csv_names = [n for n in zf.namelist() if n.endswith(".csv")]
                if not csv_names:
                    return month_str, None
                
                with zf.open(csv_names[0]) as csv_file:
                    raw_df = pd.read_csv(csv_file, header=None, low_memory=False)
                    
                    # If first row contains header strings, drop it
                    if isinstance(raw_df.iloc[0, 0], str) and "open" in str(raw_df.iloc[0, 0]).lower():
                        raw_df = raw_df.iloc[1:].reset_index(drop=True)
                    
                    # Convert column 0 (open_time) to numeric ms
                    raw_df[0] = pd.to_numeric(raw_df[0], errors="coerce")
                    raw_df = raw_df.dropna(subset=[0])

                    # Handle microsecond vs millisecond timestamps
                    raw_df[0] = np.where(raw_df[0] > 1e14, raw_df[0] / 1000.0, raw_df[0])
                    
                    # Filter to valid Unix timestamp range: 2017 to 2030 in ms
                    valid_mask = (raw_df[0] >= 1.49e12) & (raw_df[0] <= 1.90e12)
                    raw_df = raw_df[valid_mask]
                    
                    if raw_df.empty:
                        return month_str, None

                    # Convert numeric columns
                    for c in range(1, min(6, raw_df.shape[1])):
                        raw_df[c] = pd.to_numeric(raw_df[c], errors="coerce")
                    
                    # Map standard columns
                    clean_df = pd.DataFrame()
                    clean_df["open_time"] = raw_df[0].astype("int64")
                    clean_df["open"] = raw_df[1].astype("float64")
                    clean_df["high"] = raw_df[2].astype("float64")
                    clean_df["low"] = raw_df[3].astype("float64")
                    clean_df["close"] = raw_df[4].astype("float64")
                    clean_df["volume"] = raw_df[5].astype("float64")
                    
                    if raw_df.shape[1] > 7:
                        clean_df["quote_volume"] = pd.to_numeric(raw_df[7], errors="coerce").fillna(0.0).astype("float64")
                    else:
                        clean_df["quote_volume"] = clean_df["volume"] * clean_df["close"]
                        
                    if raw_df.shape[1] > 8:
                        clean_df["count"] = pd.to_numeric(raw_df[8], errors="coerce").fillna(1).astype("int64")
                    else:
                        clean_df["count"] = 1

                    if raw_df.shape[1] > 9:
                        clean_df["taker_buy_volume"] = pd.to_numeric(raw_df[9], errors="coerce").fillna(0.0).astype("float64")
                    else:
                        clean_df["taker_buy_volume"] = clean_df["volume"] * 0.5

                    if raw_df.shape[1] > 10:
                        clean_df["taker_buy_quote_volume"] = pd.to_numeric(raw_df[10], errors="coerce").fillna(0.0).astype("float64")
                    else:
                        clean_df["taker_buy_quote_volume"] = clean_df["quote_volume"] * 0.5

                    # Cache chunk
                    try:
                        clean_df.to_parquet(cached_file, compression="snappy", index=False)
                    except Exception:
                        pass

                    return month_str, clean_df
    except urllib.error.HTTPError as err:
        if err.code == 404:
            return month_str, None
        logger.warning("HTTP %s for %s", err.code, month_str)
        return month_str, None
    except Exception as exc:
        logger.warning("Failed to fetch %s: %s", month_str, exc)
        return month_str, None


def resample_ohlcv(df_1m: pd.DataFrame, rule: str) -> pd.DataFrame:
    """Vectorized resampling of 1m OHLCV DataFrame to higher timeframe."""
    resampled = df_1m.resample(rule, label="left", closed="left").agg({
        "open": "first",
        "high": "max",
        "low": "min",
        "close": "last",
        "volume": "sum",
        "quote_volume": "sum",
        "count": "sum",
        "taker_buy_volume": "sum",
        "taker_buy_quote_volume": "sum",
    }).dropna(subset=["open", "close"])
    
    resampled.reset_index(inplace=True)
    return resampled


def main() -> None:
    start_time = time.time()
    logger.info("==================================================================")
    logger.info("  PROJECT APEX — BTCUSDT 5+ YEAR 1-MINUTE DATA INGESTION ENGINE  ")
    logger.info("  Target: Full 1-Minute Historical Coverage (2017-08 to 2025-01) ")
    logger.info("==================================================================")

    # 1. Purge other pairs
    purge_other_pairs_permanently()
    BTC_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # 2. Build list of all months from 2017-08 to 2025-01
    months_to_fetch = []
    for y in range(2017, 2026):
        for m in range(1, 13):
            if y == 2017 and m < 8:
                continue
            if y == 2025 and m > 1:
                continue
            months_to_fetch.append((y, m))

    logger.info("Dispatched download of %d monthly archives with 16 parallel workers...", len(months_to_fetch))

    results: list[pd.DataFrame] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
        future_map = {
            executor.submit(fetch_and_parse_month, y, m): (y, m)
            for y, m in months_to_fetch
        }
        for future in concurrent.futures.as_completed(future_map):
            month_str, df = future.result()
            if df is not None and not df.empty:
                results.append(df)
                logger.info("✓ Processed %s: %s 1m bars", month_str, f"{len(df):,}")

    if not results:
        logger.error("No data fetched! Aborting.")
        return

    logger.info("Combining and sorting %d monthly chunks...", len(results))
    combined_df = pd.concat(results, ignore_index=True)
    
    # Sort by open_time and drop duplicates
    combined_df.sort_values("open_time", inplace=True)
    combined_df.drop_duplicates(subset=["open_time"], keep="first", inplace=True)

    # Convert open_time from ms to UTC datetime
    combined_df["open_time"] = pd.to_datetime(combined_df["open_time"], unit="ms", utc=True)
    
    # Ensure float64 / int64 types
    for c in ["open", "high", "low", "close", "volume", "quote_volume", "taker_buy_volume", "taker_buy_quote_volume"]:
        combined_df[c] = combined_df[c].astype("float64")
    combined_df["count"] = combined_df["count"].astype("int64")

    total_1m_bars = len(combined_df)
    min_date = combined_df["open_time"].min()
    max_date = combined_df["open_time"].max()

    logger.info("==================================================================")
    logger.info("  BTCUSDT 1-MINUTE MASTER DATASET READY                          ")
    logger.info("  Total 1-Minute Bars : %s", f"{total_1m_bars:,}")
    logger.info("  Start Timestamp     : %s", min_date)
    logger.info("  End Timestamp       : %s", max_date)
    logger.info("==================================================================")

    # Save 1m.parquet
    p_1m = BTC_DIR / "1m.parquet"
    logger.info("Saving master partition: %s...", p_1m)
    combined_df.to_parquet(p_1m, compression="snappy", index=False)
    logger.info("✓ 1m.parquet saved: %s bars (Size: %.2f MB)", f"{total_1m_bars:,}", p_1m.stat().st_size / (1024 * 1024))

    # Set datetime index for fast resampling
    df_indexed = combined_df.set_index("open_time")

    # Resample to all higher canonical timeframes
    timeframes = {
        "3m": "3min",
        "5m": "5min",
        "15m": "15min",
        "30m": "30min",
        "1h": "1h",
        "2h": "2h",
        "4h": "4h",
        "12h": "12h",
        "1d": "1D",
        "1w": "1W",
    }

    for tf_label, rule in timeframes.items():
        logger.info("Resampling 1m master into canonical partition: %s (%s)...", tf_label, rule)
        resampled = resample_ohlcv(df_indexed, rule)
        out_file = BTC_DIR / f"{tf_label}.parquet"
        resampled.to_parquet(out_file, compression="snappy", index=False)
        logger.info("✓ %s.parquet saved: %s bars (Size: %.2f MB)", tf_label, f"{len(resampled):,}", out_file.stat().st_size / (1024 * 1024))

    # Clean up temp cache
    if CACHE_DIR.exists():
        shutil.rmtree(CACHE_DIR)

    elapsed = time.time() - start_time
    logger.info("==================================================================")
    logger.info("  ALL BTCUSDT 1-MINUTE & DERIVED PARTITIONS READY IN %.2f SECONDS", elapsed)
    logger.info("  Grand Total 1m Bars: %s (Covering %s to %s)", f"{total_1m_bars:,}", min_date.strftime('%Y-%m-%d'), max_date.strftime('%Y-%m-%d'))
    logger.info("==================================================================")


if __name__ == "__main__":
    main()
