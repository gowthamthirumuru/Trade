"""
Top 4 Crypto Coins (BTC, ETH, SOL, BNB) 5-Year High-Frequency Data Lake Ingestion Script.

Downloads 5+ years (2020–2026) of 1m and 5m resolution OHLCV bar archives from Binance Public Archive
for the top 4 crypto assets (BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT), resamples to canonical timeframes
(1m, 5m, 15m, 1h, 4h, 1d), and consolidates snappy Parquet files into the Data Lake as mandated by Master Plan §9.5.
"""

import logging
from pathlib import Path
import sys
import time
from typing import Optional

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.datalake.binance_archive import ingest_pair
from src.datalake.resample import resample_bars

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("apex.top4_ingest")

TOP_4_PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"]
START_DATE = "2020-01-01"
END_DATE = "2026-01-01"


def download_top4_5yr_history(data_dir: Optional[Path] = None):
    """Downloads 5 years of 1m base bars for top 4 coins and generates derived timeframes."""
    root = data_dir or (PROJECT_ROOT / "data")
    t0 = time.time()

    logger.info("Starting 5-Year High-Frequency Bulk Ingestion for Top 4 Coins: %s", TOP_4_PAIRS)
    logger.info("Date Range: %s to %s", START_DATE, END_DATE)

    for pair in TOP_4_PAIRS:
        p_t0 = time.time()
        logger.info("--- Processing %s ---", pair)
        try:
            # 1. Download 1m base bars across 5 years
            file_1m = ingest_pair(
                pair=pair,
                timeframe="1m",
                start_date=START_DATE,
                end_date=END_DATE,
                output_directory=root,
                max_workers=8,
            )

            # 2. Resample into 5m, 15m, 1h, 4h, 1d timeframes
            import pandas as pd
            df_1m = pd.read_parquet(file_1m)
            logger.info("%s 1m bar download complete: %d total bars in %.2fs", pair, len(df_1m), time.time() - p_t0)

            dest_dir = root / "raw" / "binance" / pair
            for tf in ["5m", "15m", "1h", "4h", "1d"]:
                df_res = resample_bars(df_1m, target_timeframe=tf)
                if not df_res.empty:
                    tf_path = dest_dir / f"{tf}.parquet"
                    df_res.to_parquet(tf_path, compression="snappy", index=False)
                    logger.info("Resampled %s -> %s: %d bars saved to %s", pair, tf, len(df_res), tf_path.name)

        except Exception as exc:
            logger.error("Error processing 5-year history for %s: %s", pair, exc)

    logger.info("Top 4 5-Year Ingestion Complete in %.2fs", time.time() - t0)


if __name__ == "__main__":
    download_top4_5yr_history()
