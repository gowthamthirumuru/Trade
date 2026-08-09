"""
Technical Indicators Engine Module.

Computes vectorized technical indicators covering Momentum, Trend, Volatility, Volume,
and Micro-structure feature groups as specified in Master Plan §10.2 & §C2.1.

Context:
    Layer 2 (Feature Factory) component specified in Master Plan §10.2.
"""

import logging
from typing import Dict, List
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def compute_rsi(close_series: pd.Series, length: int) -> pd.Series:
    """Computes Wilder's Relative Strength Index (RSI) in a point-in-time vectorized manner.

    Formula:
        RSI = 100 - (100 / (1 + RS))
        where RS = Smoothed Gain / Smoothed Loss (Wilder's Exponential Smoothing)

    Args:
        close_series (pd.Series): Close prices series.
        length (int): RSI lookback window (e.g., 2, 7, 14, 21).

    Returns:
        pd.Series: Vectorized RSI values between 0.0 and 100.0.
    """
    delta = close_series.diff()
    gain = delta.clip(lower=0.0)
    loss = -delta.clip(upper=0.0)

    # Wilder's exponential smoothing (alpha = 1 / length)
    avg_gain = gain.ewm(alpha=1.0 / length, min_periods=length, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1.0 / length, min_periods=length, adjust=False).mean()

    rs = avg_gain / avg_loss.replace(0.0, np.nan)
    rsi = 100.0 - (100.0 / (1.0 + rs))
    return rsi.fillna(50.0)


def compute_atr(high_series: pd.Series, low_series: pd.Series, close_series: pd.Series, length: int = 14) -> pd.Series:
    """Computes Wilder's Average True Range (ATR).

    Formula:
        TR = max(High - Low, |High - Close_prev|, |Low - Close_prev|)
        ATR = Wilder Smoothing of TR over length

    Args:
        high_series (pd.Series): High prices.
        low_series (pd.Series): Low prices.
        close_series (pd.Series): Close prices.
        length (int): Lookback window. Defaults to 14.

    Returns:
        pd.Series: ATR values.
    """
    prev_close = close_series.shift(1)
    tr1 = high_series - low_series
    tr2 = (high_series - prev_close).abs()
    tr3 = (low_series - prev_close).abs()

    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1.0 / length, min_periods=length, adjust=False).mean()
    return atr


def compute_adx(high_series: pd.Series, low_series: pd.Series, close_series: pd.Series, length: int = 14) -> Dict[str, pd.Series]:
    """Computes Average Directional Index (ADX) and Directional Indicators (+DI, -DI).

    Args:
        high_series (pd.Series): High prices.
        low_series (pd.Series): Low prices.
        close_series (pd.Series): Close prices.
        length (int): Lookback period. Defaults to 14.

    Returns:
        Dict[str, pd.Series]: Dictionary containing 'adx', 'plus_di', 'minus_di'.
    """
    up_move = high_series.diff()
    down_move = -low_series.diff()

    plus_dm = np.where((up_move > down_move) & (up_move > 0), up_move, 0.0)
    minus_dm = np.where((down_move > up_move) & (down_move > 0), down_move, 0.0)

    atr = compute_atr(high_series, low_series, close_series, length=length)

    plus_di = 100.0 * pd.Series(plus_dm, index=high_series.index).ewm(alpha=1.0 / length, min_periods=length, adjust=False).mean() / atr
    minus_di = 100.0 * pd.Series(minus_dm, index=high_series.index).ewm(alpha=1.0 / length, min_periods=length, adjust=False).mean() / atr

    dx = 100.0 * (plus_di - minus_di).abs() / (plus_di + minus_di).replace(0.0, np.nan)
    adx = dx.ewm(alpha=1.0 / length, min_periods=length, adjust=False).mean().fillna(0.0)

    return {
        "adx": adx,
        "plus_di": plus_di.fillna(0.0),
        "minus_di": minus_di.fillna(0.0),
    }


def compute_donchian_position(close_series: pd.Series, low_series: pd.Series, high_series: pd.Series, length: int = 20) -> pd.Series:
    """Computes relative Donchian channel position (0.0 at 20-bar lowest low, 1.0 at 20-bar highest high).

    Args:
        close_series (pd.Series): Close prices.
        low_series (pd.Series): Low prices.
        high_series (pd.Series): High prices.
        length (int): Channel lookback length. Defaults to 20.

    Returns:
        pd.Series: Position values bounded between 0.0 and 1.0.
    """
    lowest_low = low_series.rolling(window=length, min_periods=length).min()
    highest_high = high_series.rolling(window=length, min_periods=length).max()
    denom = (highest_high - lowest_low).replace(0.0, np.nan)

    donchian_pos = (close_series - lowest_low) / denom
    return donchian_pos.clip(lower=0.0, upper=1.0).fillna(0.5)


def compute_consecutive_bars(close_series: pd.Series) -> pd.Series:
    """Computes signed count of consecutive up (+N) or down (-N) close prices.

    Args:
        close_series (pd.Series): Close prices.

    Returns:
        pd.Series: Signed consecutive bar count series.
    """
    price_diff = close_series.diff()
    direction = np.sign(price_diff).fillna(0).astype(int)

    # Detect direction flips to form cumulative blocks
    dir_changed = direction != direction.shift(1)
    block_id = dir_changed.cumsum()

    # Cumulative sum per block
    consec_count = direction.groupby(block_id).cumsum()
    return consec_count


def compute_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """Computes full suite of vectorized indicators for canonical bar DataFrame (§10.2).

    Args:
        df (pd.DataFrame): Input bar DataFrame with canonical columns (open, high, low, close, volume, quote_vol).

    Returns:
        pd.DataFrame: DataFrame populated with all technical indicators.
    """
    df_out = pd.DataFrame(index=df.index)
    close = df["close"]
    high = df["high"]
    low = df["low"]
    volume = df["volume"]
    quote_vol = df["quote_vol"]

    # 1. Momentum Group
    for rsi_len in [2, 7, 14, 21]:
        df_out[f"rsi_{rsi_len}"] = compute_rsi(close, length=rsi_len)

    # Stochastic %K and %D (14, 3)
    ll14 = low.rolling(14, min_periods=14).min()
    hh14 = high.rolling(14, min_periods=14).max()
    df_out["stoch_k"] = (100.0 * (close - ll14) / (hh14 - ll14).replace(0.0, np.nan)).fillna(50.0)
    df_out["stoch_d"] = df_out["stoch_k"].rolling(3, min_periods=3).mean().fillna(50.0)

    # MACD Histogram (12, 26, 9)
    ema12 = close.ewm(span=12, adjust=False).mean()
    ema26 = close.ewm(span=26, adjust=False).mean()
    macd_line = ema12 - ema26
    signal_line = macd_line.ewm(span=9, adjust=False).mean()
    df_out["macd_hist"] = macd_line - signal_line

    # ROC (10)
    df_out["roc_10"] = ((close / close.shift(10) - 1.0) * 100.0).fillna(0.0)

    # Williams %R (14)
    df_out["willr_14"] = (-100.0 * (hh14 - close) / (hh14 - ll14).replace(0.0, np.nan)).fillna(-50.0)

    # 2. Trend Group
    for ema_len in [9, 21, 50, 200]:
        df_out[f"ema_{ema_len}"] = close.ewm(span=ema_len, adjust=False).mean()

    # EMA200 Normalized Slope over 20 bars (§C2.1.4)
    ema200 = df_out["ema_200"]
    df_out["ema200_slope_20bar"] = ((ema200 - ema200.shift(20)) / ema200.shift(20).replace(0.0, np.nan) * 100.0).fillna(0.0)
    df_out["dist_ema200_pct"] = ((close / ema200 - 1.0) * 100.0).fillna(0.0)

    # ADX and Directional Indicators (14)
    adx_dict = compute_adx(high, low, close, length=14)
    df_out["adx_14"] = adx_dict["adx"]
    df_out["plus_di_14"] = adx_dict["plus_di"]
    df_out["minus_di_14"] = adx_dict["minus_di"]

    # Donchian Position
    df_out["donchian_pos"] = compute_donchian_position(close, low, high, length=20)

    # 3. Volatility & Volume Group
    df_out["atr_14"] = compute_atr(high, low, close, length=14)
    df_out["atr_pct"] = (df_out["atr_14"] / close * 100.0).fillna(0.0)

    # Trailing 252-day ATR Percentile (0.0 to 1.0)
    rolling_252 = df_out["atr_pct"].rolling(252, min_periods=20)
    df_out["atr_pctile_252d"] = ((df_out["atr_pct"] - rolling_252.min()) / (rolling_252.max() - rolling_252.min()).replace(0.0, np.nan)).clip(0.0, 1.0).fillna(0.5)

    # Bollinger Bands (20, 2)
    bb_mid = close.rolling(20, min_periods=20).mean()
    bb_std = close.rolling(20, min_periods=20).std()
    bb_upper = bb_mid + (2.0 * bb_std)
    bb_lower = bb_mid - (2.0 * bb_std)

    df_out["bb_pctb"] = ((close - bb_lower) / (bb_upper - bb_lower).replace(0.0, np.nan)).fillna(0.5)
    df_out["bb_width"] = ((bb_upper - bb_lower) / bb_mid.replace(0.0, np.nan)).fillna(0.0)

    # Volume z-score (20d) & Dollar Volume
    vol_mean20 = volume.rolling(20, min_periods=20).mean()
    vol_std20 = volume.rolling(20, min_periods=20).std()
    df_out["vol_z_20"] = ((volume - vol_mean20) / vol_std20.replace(0.0, np.nan)).fillna(0.0)
    df_out["dollar_vol_20d"] = quote_vol.rolling(20, min_periods=20).mean().fillna(0.0)

    # 4. Micro-Structure Group
    prev_close = close.shift(1)
    df_out["gap_pct"] = ((df["open"] - prev_close) / prev_close.replace(0.0, np.nan) * 100.0).fillna(0.0)

    range_span = (high - low).replace(0.0, np.nan)
    df_out["range_pos"] = ((close - low) / range_span).clip(0.0, 1.0).fillna(0.5)
    df_out["consec_bars"] = compute_consecutive_bars(close)

    return df_out
