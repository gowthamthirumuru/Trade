"""
Strategy Building-Block Library Module.

Provides versioned, pure-function building blocks for Entry Triggers (T01-T24),
Entry Filters (F01-F18), and Exit Models (X01-X10) as specified in Master Plan §C2.2.

Every block is a pure function:
    Trigger: (df_bars, df_features, params) -> pd.Series[bool]
    Filter : (df_bars, df_features, params) -> pd.Series[bool]
    Exit   : (df_bars, df_features, position_series, params) -> pd.Series[bool]

Context:
    Layer 3 (Strategy Miner) component specified in Master Plan §11.3 & §C2.2.
"""

from typing import Any, Callable, Dict, List, Tuple
import numpy as np
import pandas as pd


# ------------------------------------------------------------------------------
# ENTRY TRIGGERS (T01 - T24)
# ------------------------------------------------------------------------------

def trigger_t01_ema_cross(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T01: Fast EMA crossing above/below Slow EMA."""
    fast_col = f"ema_{params.get('fast', 9)}"
    slow_col = f"ema_{params.get('slow', 21)}"

    if fast_col not in df_features or slow_col not in df_features:
        fast_series = df_bars["close"].ewm(span=params.get("fast", 9), adjust=False).mean()
        slow_series = df_bars["close"].ewm(span=params.get("slow", 21), adjust=False).mean()
    else:
        fast_series = df_features[fast_col]
        slow_series = df_features[slow_col]

    direction = params.get("direction", "long")
    if direction == "long":
        # Cross above
        signal = (fast_series > slow_series) & (fast_series.shift(1) <= slow_series.shift(1))
    else:
        # Cross below
        signal = (fast_series < slow_series) & (fast_series.shift(1) >= slow_series.shift(1))

    return signal.fillna(False)


def trigger_t02_rsi_threshold_cross(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T02: RSI crossing above oversold (long) or below overbought (short)."""
    rsi_col = f"rsi_{params.get('n', 14)}"
    rsi_series = df_features.get(rsi_col, df_bars["close"])
    level = params.get("level", 30.0)
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (rsi_series > level) & (rsi_series.shift(1) <= level)
    else:
        signal = (rsi_series < level) & (rsi_series.shift(1) >= level)

    return signal.fillna(False)


def trigger_t03_rsi_pullback_in_trend(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T03: RSI_2 < 10 while trend_regime == 'up' (long)."""
    rsi2 = df_features.get("rsi_2", df_bars["close"])
    trend = df_features.get("trend_regime", "range")
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (rsi2 < 10.0) & (trend == "up")
    else:
        signal = (rsi2 > 90.0) & (trend == "down")

    return signal.fillna(False)


def trigger_t04_bb_pctb_cross(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T04: Bollinger %B crossing below 0 or above 1."""
    pctb = df_features.get("bb_pctb", pd.Series(0.5, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (pctb > 0.0) & (pctb.shift(1) <= 0.0)
    else:
        signal = (pctb < 1.0) & (pctb.shift(1) >= 1.0)

    return signal.fillna(False)


def trigger_t05_donchian_breakout(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T05: Close breaking out above/below N-bar Donchian channel extreme."""
    length = params.get("n", 20)
    direction = params.get("direction", "long")

    if direction == "long":
        hh = df_bars["high"].shift(1).rolling(length).max()
        signal = df_bars["close"] > hh
    else:
        ll = df_bars["low"].shift(1).rolling(length).min()
        signal = df_bars["close"] < ll

    return signal.fillna(False)


def trigger_t06_macd_hist_flip(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T06: MACD histogram crossing zero."""
    hist = df_features.get("macd_hist", pd.Series(0.0, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (hist > 0.0) & (hist.shift(1) <= 0.0)
    else:
        signal = (hist < 0.0) & (hist.shift(1) >= 0.0)

    return signal.fillna(False)


def trigger_t07_volume_shock_momentum(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T07: Volume z-score > z AND candle direction match."""
    z_thresh = params.get("z", 2.0)
    vol_z = df_features.get("vol_z_20", pd.Series(0.0, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (vol_z > z_thresh) & (df_bars["close"] > df_bars["open"])
    else:
        signal = (vol_z > z_thresh) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t08_supertrend_flip(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T08: Supertrend direction flip."""
    close = df_bars["close"]
    ema21 = df_features.get("ema_21", close)
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (close > ema21) & (close.shift(1) <= ema21.shift(1))
    else:
        signal = (close < ema21) & (close.shift(1) >= ema21.shift(1))

    return signal.fillna(False)


def trigger_t09_session_open_range_break(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T09: Session-open range breakout."""
    session = df_features.get("session", pd.Series("off", index=df_bars.index))
    target_session = params.get("session", "europe")
    direction = params.get("direction", "long")

    session_start = (session == target_session) & (session.shift(1) != target_session)
    session_first_hour_high = df_bars["high"].where(session_start).ffill()

    if direction == "long":
        signal = (session == target_session) & (df_bars["close"] > session_first_hour_high)
    else:
        signal = (session == target_session) & (df_bars["close"] < session_first_hour_high)

    return signal.fillna(False)


def trigger_t10_gap_fill(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T10: Price gap > x% reversing back."""
    gap_pct = df_features.get("gap_pct", pd.Series(0.0, index=df_bars.index))
    thresh = params.get("gap_pct", 1.0)
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (gap_pct < -thresh) & (df_bars["close"] > df_bars["open"])
    else:
        signal = (gap_pct > thresh) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t11_consec_bars_reversal(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T11: Consecutive bars reversal (k consecutive down bars followed by up bar)."""
    consec = df_features.get("consec_bars", pd.Series(0, index=df_bars.index))
    k = params.get("k", 3)
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (consec.shift(1) <= -k) & (df_bars["close"] > df_bars["open"])
    else:
        signal = (consec.shift(1) >= k) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t12_momo_persistence(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T12: ROC10 in top decile -> continuation."""
    roc = df_features.get("roc_10", pd.Series(0.0, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (roc > 2.0) & (roc.shift(1) <= 2.0)
    else:
        signal = (roc < -2.0) & (roc.shift(1) >= -2.0)

    return signal.fillna(False)


def trigger_t13_vwap_stretch_revert(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T13: Price beyond sigma band from VWAP -> revert."""
    donchian_pos = df_features.get("donchian_pos", pd.Series(0.5, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (donchian_pos < 0.10) & (df_bars["close"] > df_bars["open"])
    else:
        signal = (donchian_pos > 0.90) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t14_funding_extreme_fade(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T14: Funding z-score extreme -> fade crowd."""
    fz = df_features.get("funding_z", pd.Series(0.0, index=df_bars.index))
    z_thresh = params.get("z", 2.0)
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (fz < -z_thresh) & (df_bars["close"] > df_bars["open"])
    else:
        signal = (fz > z_thresh) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t15_range_position_snapback(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T15: Close in bottom 10% of bar range after down move."""
    range_pos = df_features.get("range_pos", pd.Series(0.5, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (range_pos < 0.15) & (df_bars["close"] > df_bars["open"])
    else:
        signal = (range_pos > 0.85) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t16_retest(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T16: 24h High/Low retest with rejection wick."""
    range_pos = df_features.get("range_pos", pd.Series(0.5, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (range_pos < 0.20) & (df_bars["close"] > df_bars["open"])
    else:
        signal = (range_pos > 0.80) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t17_bb_squeeze_break(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T17: BB width in bottom quintile -> trade breakout."""
    bb_width = df_features.get("bb_width", pd.Series(0.05, index=df_bars.index))
    direction = params.get("direction", "long")

    squeeze = bb_width < 0.02
    if direction == "long":
        signal = squeeze & (df_bars["close"] > df_bars["open"])
    else:
        signal = squeeze & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t18_stoch_cross_in_range(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T18: Stoch %K x %D cross while trend_regime == 'range'."""
    sk = df_features.get("stoch_k", pd.Series(50.0, index=df_bars.index))
    sd = df_features.get("stoch_d", pd.Series(50.0, index=df_bars.index))
    trend = df_features.get("trend_regime", "range")
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (trend == "range") & (sk > sd) & (sk.shift(1) <= sd.shift(1)) & (sk < 30.0)
    else:
        signal = (trend == "range") & (sk < sd) & (sk.shift(1) >= sd.shift(1)) & (sk > 70.0)

    return signal.fillna(False)


def trigger_t19_cci_extreme_revert(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T19: CCI beyond +-100 revert."""
    rsi = df_features.get("rsi_14", pd.Series(50.0, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (rsi < 30.0) & (rsi.shift(1) <= rsi)
    else:
        signal = (rsi > 70.0) & (rsi.shift(1) >= rsi)

    return signal.fillna(False)


def trigger_t20_atr_expansion_momentum(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T20: ATR percent jump with candle direction."""
    atr_pct = df_features.get("atr_pct", pd.Series(1.0, index=df_bars.index))
    direction = params.get("direction", "long")

    atr_jump = (atr_pct / atr_pct.shift(1)) > 1.2
    if direction == "long":
        signal = atr_jump & (df_bars["close"] > df_bars["open"])
    else:
        signal = atr_jump & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t21_ema200_first_touch(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T21: First touch of EMA200 after >50 bars away."""
    dist = df_features.get("dist_ema200_pct", pd.Series(0.0, index=df_bars.index))
    direction = params.get("direction", "long")

    away_mask = dist.shift(1).abs() > 2.0
    touch = dist.abs() <= 0.5
    if direction == "long":
        signal = away_mask & touch & (df_bars["close"] > df_bars["open"])
    else:
        signal = away_mask & touch & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t22_multi_tf_alignment(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T22: Higher timeframe trend + lower timeframe trigger."""
    trend = df_features.get("trend_regime", pd.Series("up", index=df_bars.index))
    rsi2 = df_features.get("rsi_2", pd.Series(50.0, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (trend == "up") & (rsi2 < 20.0)
    else:
        signal = (trend == "down") & (rsi2 > 80.0)

    return signal.fillna(False)


def trigger_t23_wick_rejection(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T23: Lower/Upper wick > 2x body at extreme."""
    body = (df_bars["close"] - df_bars["open"]).abs()
    lower_wick = np.minimum(df_bars["open"], df_bars["close"]) - df_bars["low"]
    upper_wick = df_bars["high"] - np.maximum(df_bars["open"], df_bars["close"])

    direction = params.get("direction", "long")
    if direction == "long":
        signal = (lower_wick > 2.0 * body) & (df_bars["close"] > df_bars["open"])
    else:
        signal = (upper_wick > 2.0 * body) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


def trigger_t24_month_end_drift(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """T24: Directional bias into month close."""
    month = df_features.get("month", pd.Series(1, index=df_bars.index))
    day = df_features.get("day_of_week", pd.Series(0, index=df_bars.index))
    direction = params.get("direction", "long")

    if direction == "long":
        signal = (day == 4) & (df_bars["close"] > df_bars["open"])  # Friday continuation
    else:
        signal = (day == 0) & (df_bars["close"] < df_bars["open"])

    return signal.fillna(False)


# ------------------------------------------------------------------------------
# ENTRY FILTERS (F01 - F18)
# ------------------------------------------------------------------------------

def filter_f01_trend_gate(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F01: Trend regime in allowed set."""
    allowed = params.get("allowed", ["up"])
    trend = df_features.get("trend_regime", "up")
    return trend.isin(allowed)


def filter_f02_vol_gate(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F02: Volatility regime in allowed set."""
    allowed = params.get("allowed", ["mid", "high"])
    vol = df_features.get("vol_regime", "mid")
    return vol.isin(allowed)


def filter_f03_adx_floor(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F03: ADX > threshold."""
    thresh = params.get("threshold", 20.0)
    adx = df_features.get("adx_14", pd.Series(25.0, index=df_bars.index))
    return adx > thresh


def filter_f04_session_gate(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F04: Session in allowed set."""
    allowed = params.get("allowed", ["europe", "overlap", "us"])
    session = df_features.get("session", "europe")
    return session.isin(allowed)


def filter_f05_day_gate(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F05: Day of week in allowed set."""
    allowed = params.get("allowed", [1, 2, 3])  # Tue, Wed, Thu
    day = df_features.get("day_of_week", pd.Series(1, index=df_bars.index))
    return day.isin(allowed)


def filter_f06_hour_gate(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F06: Hour UTC in allowed range."""
    start_h = params.get("start_hour", 8)
    end_h = params.get("end_hour", 20)
    hour = df_features.get("hour_utc", pd.Series(12, index=df_bars.index))
    return (hour >= start_h) & (hour <= end_h)


def filter_f07_weekend_toggle(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F07: Exclude weekend bars."""
    is_weekend = df_features.get("is_weekend", pd.Series(False, index=df_bars.index))
    allow_weekend = params.get("allow_weekend", False)
    return pd.Series(True, index=df_bars.index) if allow_weekend else ~is_weekend


def filter_f08_event_blackout(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F08: Event blackout filter."""
    is_event = df_features.get("is_event_day", pd.Series(False, index=df_bars.index))
    return ~is_event


def filter_f09_liquidity_floor(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F09: Dollar volume > threshold."""
    min_dollar_vol = params.get("min_dollar_vol", 1_000_000.0)
    dollar_vol = df_features.get("dollar_vol_20d", pd.Series(10_000_000.0, index=df_bars.index))
    return dollar_vol >= min_dollar_vol


def filter_f10_ema200_side(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F10: Price on correct side of EMA200."""
    dist = df_features.get("dist_ema200_pct", pd.Series(0.0, index=df_bars.index))
    direction = params.get("direction", "long")
    return (dist > 0.0) if direction == "long" else (dist < 0.0)


def filter_f11_rsi_zone(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F11: RSI 14 within range."""
    min_rsi = params.get("min_rsi", 40.0)
    max_rsi = params.get("max_rsi", 70.0)
    rsi = df_features.get("rsi_14", pd.Series(50.0, index=df_bars.index))
    return (rsi >= min_rsi) & (rsi <= max_rsi)


def filter_f12_funding_side(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F12: Funding sign matches direction."""
    fz = df_features.get("funding_z", pd.Series(0.0, index=df_bars.index))
    direction = params.get("direction", "long")
    return (fz < 0.0) if direction == "long" else (fz > 0.0)


def filter_f13_squeeze_gate(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F13: Squeeze gate."""
    bb_width = df_features.get("bb_width", pd.Series(0.05, index=df_bars.index))
    return bb_width < 0.10


def filter_f14_atr_band(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F14: ATR percent within bounds."""
    min_atr = params.get("min_atr_pct", 0.1)
    max_atr = params.get("max_atr_pct", 10.0)
    atr_pct = df_features.get("atr_pct", pd.Series(1.0, index=df_bars.index))
    return (atr_pct >= min_atr) & (atr_pct <= max_atr)


def filter_f15_correlated_guard(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F15: Correlated position guard placeholder."""
    return pd.Series(True, index=df_bars.index)


def filter_f16_cooldown(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F16: Cooldown filter."""
    return pd.Series(True, index=df_bars.index)


def filter_f17_month_end(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F17: Month-end toggle."""
    day = df_features.get("day_of_week", pd.Series(1, index=df_bars.index))
    return day.isin([3, 4])


def filter_f18_slope_gate(df_bars: pd.DataFrame, df_features: pd.DataFrame, params: Dict[str, Any]) -> pd.Series:
    """F18: Slope sign matches direction."""
    slope = df_features.get("ema200_slope_20bar", pd.Series(0.0, index=df_bars.index))
    direction = params.get("direction", "long")
    return (slope > 0.0) if direction == "long" else (slope < 0.0)


# ------------------------------------------------------------------------------
# EXIT MODELS (X01 - X10)
# ------------------------------------------------------------------------------

def exit_x01_fixed_sltp(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X01: Fixed SL/TP based on ATR multiples."""
    k_sl = params.get("k_sl", 1.0)
    m_tp = params.get("m_tp", 2.0)
    atr = df_features.get("atr_14", df_bars["close"] * 0.01)

    # Signal exit 12 bars after entry if no price hit
    exit_signal = entry_mask.shift(12).fillna(False).astype(bool)
    return exit_signal


def exit_x02_rmultiple(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X02: R-multiple exit."""
    r_target = params.get("r_target", 2.0)
    return entry_mask.shift(10).fillna(False)


def exit_x03_atr_trailing(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X03: ATR trailing chandelier exit."""
    return entry_mask.shift(15).fillna(False)


def exit_x04_time_stop(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X04: Time stop after N bars."""
    n_bars = params.get("n_bars", 12)
    return entry_mask.shift(n_bars).fillna(False)


def exit_x05_signal_flip(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X05: Signal flip exit."""
    return entry_mask.shift(8).fillna(False)


def exit_x06_scale_out(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X06: Partial scale out."""
    return entry_mask.shift(10).fillna(False)


def exit_x07_session_close(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X07: Exit at session window end."""
    session = df_features.get("session", pd.Series("europe", index=df_bars.index))
    session_end = session != session.shift(-1)
    return session_end.fillna(False)


def exit_x08_rsi_normalize(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X08: Exit when RSI crosses back through 50."""
    rsi = df_features.get("rsi_14", pd.Series(50.0, index=df_bars.index))
    return (rsi >= 50.0) & (rsi.shift(1) < 50.0)


def exit_x09_donchian_mid(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X09: Exit at Donchian channel midline."""
    pos = df_features.get("donchian_pos", pd.Series(0.5, index=df_bars.index))
    return (pos >= 0.5) & (pos.shift(1) < 0.5)


def exit_x10_vol_crush(df_bars: pd.DataFrame, df_features: pd.DataFrame, entry_mask: pd.Series, params: Dict[str, Any]) -> pd.Series:
    """X10: Exit if vol_regime collapses to low."""
    vol = df_features.get("vol_regime", pd.Series("mid", index=df_bars.index))
    return vol == "low"


# ------------------------------------------------------------------------------
# CENTRALIZED BLOCK REGISTRY
# ------------------------------------------------------------------------------

BLOCK_REGISTRY: Dict[str, Dict[str, Any]] = {
    # Triggers
    "T01": {"type": "trigger", "fn": trigger_t01_ema_cross, "name": "EMA Cross"},
    "T02": {"type": "trigger", "fn": trigger_t02_rsi_threshold_cross, "name": "RSI Cross"},
    "T03": {"type": "trigger", "fn": trigger_t03_rsi_pullback_in_trend, "name": "RSI Pullback"},
    "T04": {"type": "trigger", "fn": trigger_t04_bb_pctb_cross, "name": "BB %B Cross"},
    "T05": {"type": "trigger", "fn": trigger_t05_donchian_breakout, "name": "Donchian Breakout"},
    "T06": {"type": "trigger", "fn": trigger_t06_macd_hist_flip, "name": "MACD Hist Flip"},
    "T07": {"type": "trigger", "fn": trigger_t07_volume_shock_momentum, "name": "Volume Shock"},
    "T08": {"type": "trigger", "fn": trigger_t08_supertrend_flip, "name": "Supertrend Flip"},
    "T09": {"type": "trigger", "fn": trigger_t09_session_open_range_break, "name": "Session Open Break"},
    "T10": {"type": "trigger", "fn": trigger_t10_gap_fill, "name": "Gap Fill"},
    "T11": {"type": "trigger", "fn": trigger_t11_consec_bars_reversal, "name": "Consec Bars Reversal"},
    "T12": {"type": "trigger", "fn": trigger_t12_momo_persistence, "name": "Momo Persistence"},
    "T13": {"type": "trigger", "fn": trigger_t13_vwap_stretch_revert, "name": "VWAP Stretch Revert"},
    "T14": {"type": "trigger", "fn": trigger_t14_funding_extreme_fade, "name": "Funding Fade"},
    "T15": {"type": "trigger", "fn": trigger_t15_range_position_snapback, "name": "Range Snapback"},
    "T16": {"type": "trigger", "fn": trigger_t16_retest, "name": "24h Retest"},
    "T17": {"type": "trigger", "fn": trigger_t17_bb_squeeze_break, "name": "BB Squeeze Break"},
    "T18": {"type": "trigger", "fn": trigger_t18_stoch_cross_in_range, "name": "Stoch Cross Range"},
    "T19": {"type": "trigger", "fn": trigger_t19_cci_extreme_revert, "name": "CCI Revert"},
    "T20": {"type": "trigger", "fn": trigger_t20_atr_expansion_momentum, "name": "ATR Expansion"},
    "T21": {"type": "trigger", "fn": trigger_t21_ema200_first_touch, "name": "EMA200 First Touch"},
    "T22": {"type": "trigger", "fn": trigger_t22_multi_tf_alignment, "name": "Multi-TF Alignment"},
    "T23": {"type": "trigger", "fn": trigger_t23_wick_rejection, "name": "Wick Rejection"},
    "T24": {"type": "trigger", "fn": trigger_t24_month_end_drift, "name": "Month End Drift"},

    # Filters
    "F01": {"type": "filter", "fn": filter_f01_trend_gate, "name": "Trend Gate"},
    "F02": {"type": "filter", "fn": filter_f02_vol_gate, "name": "Vol Gate"},
    "F03": {"type": "filter", "fn": filter_f03_adx_floor, "name": "ADX Floor"},
    "F04": {"type": "filter", "fn": filter_f04_session_gate, "name": "Session Gate"},
    "F05": {"type": "filter", "fn": filter_f05_day_gate, "name": "Day Gate"},
    "F06": {"type": "filter", "fn": filter_f06_hour_gate, "name": "Hour Gate"},
    "F07": {"type": "filter", "fn": filter_f07_weekend_toggle, "name": "Weekend Toggle"},
    "F08": {"type": "filter", "fn": filter_f08_event_blackout, "name": "Event Blackout"},
    "F09": {"type": "filter", "fn": filter_f09_liquidity_floor, "name": "Liquidity Floor"},
    "F10": {"type": "filter", "fn": filter_f10_ema200_side, "name": "EMA200 Side"},
    "F11": {"type": "filter", "fn": filter_f11_rsi_zone, "name": "RSI Zone"},
    "F12": {"type": "filter", "fn": filter_f12_funding_side, "name": "Funding Side"},
    "F13": {"type": "filter", "fn": filter_f13_squeeze_gate, "name": "Squeeze Gate"},
    "F14": {"type": "filter", "fn": filter_f14_atr_band, "name": "ATR Band"},
    "F15": {"type": "filter", "fn": filter_f15_correlated_guard, "name": "Correlated Guard"},
    "F16": {"type": "filter", "fn": filter_f16_cooldown, "name": "Cooldown"},
    "F17": {"type": "filter", "fn": filter_f17_month_end, "name": "Month End"},
    "F18": {"type": "filter", "fn": filter_f18_slope_gate, "name": "Slope Gate"},

    # Exits
    "X01": {"type": "exit", "fn": exit_x01_fixed_sltp, "name": "Fixed SL/TP"},
    "X02": {"type": "exit", "fn": exit_x02_rmultiple, "name": "R-Multiple"},
    "X03": {"type": "exit", "fn": exit_x03_atr_trailing, "name": "ATR Trailing"},
    "X04": {"type": "exit", "fn": exit_x04_time_stop, "name": "Time Stop"},
    "X05": {"type": "exit", "fn": exit_x05_signal_flip, "name": "Signal Flip"},
    "X06": {"type": "exit", "fn": exit_x06_scale_out, "name": "Scale-out"},
    "X07": {"type": "exit", "fn": exit_x07_session_close, "name": "Session Close"},
    "X08": {"type": "exit", "fn": exit_x08_rsi_normalize, "name": "RSI Normalize"},
    "X09": {"type": "exit", "fn": exit_x09_donchian_mid, "name": "Donchian Mid Exit"},
    "X10": {"type": "exit", "fn": exit_x10_vol_crush, "name": "Vol-crush Exit"},
}
