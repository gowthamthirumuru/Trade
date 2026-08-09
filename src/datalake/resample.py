"""
Vectorized Timeframe Resampler Module.

Transforms base 1m OHLCV+ candle series into higher timeframe series (5m, 15m, 1h, 4h, 1d)
using strict, deterministic pandas aggregation rules indexed by bar open time.

Context:
    Layer 1 (Data Lake) component specified in Master Plan §9.5 Item 4 & §C2.11.2.
"""

import logging
from typing import Dict
import pandas as pd

logger = logging.getLogger(__name__)

# Map APEX timeframe identifiers to pandas frequency strings
TIMEFRAME_PANDAS_RULES: Dict[str, str] = {
    "5m": "5min",
    "15m": "15min",
    "1h": "1h",
    "4h": "4h",
    "1d": "1D",
}

# Standard aggregation dictionary for OHLCV+ columns (§9.4)
OHLCV_AGGREGATIONS: Dict[str, str] = {
    "open": "first",
    "high": "max",
    "low": "min",
    "close": "last",
    "volume": "sum",
    "quote_vol": "sum",
    "trades": "sum",
    "taker_buy": "sum",
}


def resample_bars(df_1m: pd.DataFrame, target_timeframe: str) -> pd.DataFrame:
    """Resamples base 1m bar DataFrame into specified higher timeframe deterministically.

    Resampling Rules (§9.4):
        - Indexed by bar open_time (UTC).
        - Right-label nothing; origin aligned to epoch.
        - Open: first, High: max, Low: min, Close: last.
        - Volume, Quote Volume, Trades count, Taker Buy volume: sum.
        - Empty resample bins (gaps) are dropped.

    Args:
        df_1m (pd.DataFrame): Input DataFrame containing 1m canonical bars.
        target_timeframe (str): Target timeframe identifier ('5m', '15m', '1h', '4h', '1d').

    Returns:
        pd.DataFrame: Resampled DataFrame in canonical bar schema.

    Raises:
        ValueError: If target_timeframe is unsupported or input DataFrame lacks required columns.
    """
    if target_timeframe not in TIMEFRAME_PANDAS_RULES:
        raise ValueError(
            f"Unsupported target timeframe '{target_timeframe}'. "
            f"Supported timeframes: {list(TIMEFRAME_PANDAS_RULES.keys())}"
        )

    required_columns = ["open_time", "open", "high", "low", "close", "volume", "quote_vol", "trades", "taker_buy"]
    missing = [col for col in required_columns if col not in df_1m.columns]
    if missing:
        raise ValueError(f"Input DataFrame missing required canonical columns: {missing}")

    if df_1m.empty:
        logger.warning("Resample invoked on empty DataFrame for timeframe %s", target_timeframe)
        return df_1m.copy()

    freq_rule = TIMEFRAME_PANDAS_RULES[target_timeframe]

    # Ensure open_time is set as index and strictly in UTC
    df_indexed = df_1m.copy()
    if not isinstance(df_indexed["open_time"].dtype, pd.DatetimeTZDtype):
        df_indexed["open_time"] = pd.to_datetime(df_indexed["open_time"], utc=True)

    df_indexed = df_indexed.set_index("open_time")

    # Perform resample with epoch origin alignment
    resampled = df_indexed.resample(freq_rule, origin="epoch").agg(OHLCV_AGGREGATIONS)

    # Drop missing bins created by gaps in the source series
    resampled = resampled.dropna(subset=["open"]).reset_index()

    # Re-attach pair label if present
    if "pair" in df_1m.columns:
        pair_val = df_1m["pair"].iloc[0]
        resampled["pair"] = pair_val
    else:
        resampled["pair"] = "UNKNOWN"

    resampled["timeframe"] = target_timeframe

    logger.debug("Resampled %d 1m bars into %d %s bars", len(df_1m), len(resampled), target_timeframe)
    return resampled
