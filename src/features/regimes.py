"""
Market Regime Classification Engine Module.

Computes pinned, version-controlled trend and volatility regime labels as specified in Master Plan §10.3.

Pinned Rules (§10.3):
    Trend Regime:
        - 'up'   : ema200_slope_20bar > 0 AND adx14 >= 22
        - 'down' : ema200_slope_20bar < 0 AND adx14 >= 22
        - 'range': adx14 < 22

    Volatility Regime:
        - 'low'    : atr_pctile_252d < 0.25
        - 'mid'    : 0.25 <= atr_pctile_252d < 0.75
        - 'high'   : 0.75 <= atr_pctile_252d < 0.95
        - 'extreme': atr_pctile_252d >= 0.95

Context:
    Layer 2 (Feature Factory) component specified in Master Plan §10.3.
"""

import logging
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def compute_trend_regime(ema200_slope_20bar: pd.Series, adx_14: pd.Series, adx_threshold: float = 22.0) -> pd.Series:
    """Classifies market trend regime into 'up', 'down', or 'range' based on §10.3 pinned rules.

    Args:
        ema200_slope_20bar (pd.Series): 20-bar slope of EMA200 (%).
        adx_14 (pd.Series): ADX (14) series.
        adx_threshold (float): ADX threshold for trend presence. Defaults to 22.0.

    Returns:
        pd.Series: Categorical string series in {'up', 'down', 'range'}.
    """
    conditions = [
        (adx_14 >= adx_threshold) & (ema200_slope_20bar > 0.0),
        (adx_14 >= adx_threshold) & (ema200_slope_20bar < 0.0),
        (adx_14 < adx_threshold),
    ]
    choices = ["up", "down", "range"]

    # Default to 'range' if ambiguous
    trend_regime = pd.Series(np.select(conditions, choices, default="range"), index=adx_14.index)
    return trend_regime


def compute_volatility_regime(atr_pctile_252d: pd.Series) -> pd.Series:
    """Classifies market volatility regime into 'low', 'mid', 'high', or 'extreme' based on §10.3 quartiles.

    Args:
        atr_pctile_252d (pd.Series): Trailing 252-day ATR percentile series (0.0 to 1.0).

    Returns:
        pd.Series: Categorical string series in {'low', 'mid', 'high', 'extreme'}.
    """
    conditions = [
        (atr_pctile_252d < 0.25),
        (atr_pctile_252d >= 0.25) & (atr_pctile_252d < 0.75),
        (atr_pctile_252d >= 0.75) & (atr_pctile_252d < 0.95),
        (atr_pctile_252d >= 0.95),
    ]
    choices = ["low", "mid", "high", "extreme"]

    vol_regime = pd.Series(np.select(conditions, choices, default="mid"), index=atr_pctile_252d.index)
    return vol_regime


def compute_all_regimes(df_features: pd.DataFrame) -> pd.DataFrame:
    """Computes and attaches trend_regime and vol_regime columns to feature DataFrame.

    Args:
        df_features (pd.DataFrame): Input DataFrame containing 'ema200_slope_20bar', 'adx_14', and 'atr_pctile_252d'.

    Returns:
        pd.DataFrame: DataFrame containing 'trend_regime' and 'vol_regime'.
    """
    df_regimes = pd.DataFrame(index=df_features.index)

    df_regimes["trend_regime"] = compute_trend_regime(
        df_features["ema200_slope_20bar"],
        df_features["adx_14"],
    )

    df_regimes["vol_regime"] = compute_volatility_regime(
        df_features["atr_pctile_252d"],
    )

    return df_regimes
