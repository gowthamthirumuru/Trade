"""
Feature Factory Orchestrator & Materializer Module.

Combines indicators, time/session features, regime labelers, and event data into a unified,
labeled feature dataset and materializes `.features.parquet` files locally.

Context:
    Layer 2 (Feature Factory) component specified in Master Plan §10.4.
"""

import logging
from pathlib import Path
from typing import Optional
import pandas as pd

from src.features.indicators import compute_all_indicators
from src.features.regimes import compute_all_regimes
from src.features.time_session import compute_time_and_session_features

logger = logging.getLogger(__name__)

CURRENT_FEATURE_VERSION: str = "v1.0.0"
WARMUP_BAR_COUNT: int = 252


def build_features_for_bars(
    df_bars: pd.DataFrame,
    feature_version: str = CURRENT_FEATURE_VERSION,
    warmup_bars: int = WARMUP_BAR_COUNT,
) -> pd.DataFrame:
    """Transforms raw canonical bar DataFrame into a fully enriched feature DataFrame.

    Rules (§10.4):
        - Strict point-in-time correctness (no lookahead).
        - Warmup rows (first 252 bars) are explicitly marked with `is_warmup = True`.
        - Deterministic: same input -> same output.
        - Pinned semver versioning via `feature_version` column.

    Args:
        df_bars (pd.DataFrame): Raw bar DataFrame in canonical schema.
        feature_version (str): Feature version identifier. Defaults to 'v1.0.0'.
        warmup_bars (int): Number of initial warmup bars. Defaults to 252.

    Returns:
        pd.DataFrame: Enriched feature DataFrame indexed matching input bars.
    """
    if df_bars.empty:
        logger.warning("build_features_for_bars invoked on empty DataFrame")
        return pd.DataFrame()

    df_clean = df_bars.sort_values("open_time").reset_index(drop=True)

    # 1. Compute Technical Indicators
    df_indicators = compute_all_indicators(df_clean)

    # 2. Compute Time & Session Features
    df_time_session = compute_time_and_session_features(df_clean["open_time"])

    # 3. Compute Pinned Regimes (§10.3)
    df_regimes = compute_all_regimes(df_indicators)

    # Combine into consolidated feature DataFrame
    df_features = pd.concat(
        [
            df_clean[["open_time", "pair", "timeframe", "open", "high", "low", "close", "volume"]],
            df_time_session,
            df_regimes,
            df_indicators,
        ],
        axis=1,
    )

    # 4. Mark Warmup Rows (§10.4 Item 3)
    df_features["is_warmup"] = False
    if len(df_features) > 0:
        actual_warmup = min(warmup_bars, len(df_features))
        df_features.loc[: actual_warmup - 1, "is_warmup"] = True

    df_features["feature_version"] = feature_version

    logger.debug("Successfully built %d feature rows (Version: %s)", len(df_features), feature_version)
    return df_features


def materialize_features_for_pair(
    pair: str,
    timeframe: str,
    data_dir: Path,
    feature_version: str = CURRENT_FEATURE_VERSION,
) -> Path:
    """Reads raw bar Parquet file, builds features, and writes `.features.parquet` file.

    Args:
        pair (str): Pair symbol (e.g. 'BTCUSDT').
        timeframe (str): Timeframe symbol (e.g. '1m').
        data_dir (Path): Root data directory.
        feature_version (str): Feature semver tag.

    Returns:
        Path: Path to materialized features Parquet file.
    """
    raw_file = data_dir / "raw" / "binance" / pair / f"{timeframe}.parquet"
    if not raw_file.exists():
        raise FileNotFoundError(f"Raw bar file missing for pair {pair} tf {timeframe} at {raw_file}")

    df_bars = pd.read_parquet(raw_file)
    df_features = build_features_for_bars(df_bars, feature_version=feature_version)

    target_file = data_dir / "features" / pair / f"{timeframe}.features.parquet"
    target_file.parent.mkdir(parents=True, exist_ok=True)
    df_features.to_parquet(target_file, index=False, compression="snappy")

    logger.info("Materialized feature file for %s %s to %s (%d rows)", pair, timeframe, target_file, len(df_features))
    return target_file
