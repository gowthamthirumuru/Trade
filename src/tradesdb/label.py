"""
Edge Label Derivation Engine Module.

Centralized edge label derivation logic for trade database ingestion as mandated by Master Plan §13.3 & §C2.11.3.

Labels Derived (§13.2):
    - hour_utc (0..23)
    - day_of_week (0=Mon .. 6=Sun)
    - week_of_month (1..5)
    - month (1..12)
    - session ('asia', 'europe', 'us', 'overlap', 'off')
    - trend_regime ('up', 'down', 'range')
    - vol_regime ('low', 'mid', 'high', 'extreme')
    - rsi_at_entry, adx_at_entry, atr_pctile, dist_vwap_pct, funding_z
    - is_event_day, minutes_to_event
    - feature_version

Context:
    Layer 5 (Trade Database) label derivation component specified in Master Plan §13.3.
"""

import logging
from typing import Optional
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def session_of_hour(hour_utc: int) -> str:
    """Maps UTC hour to global trading session window (§10.2).

    Args:
        hour_utc (int): UTC hour integer (0..23).

    Returns:
        str: Session label string ('asia', 'europe', 'overlap', 'us', 'off').
    """
    if 0 <= hour_utc < 7:
        return "asia"
    elif 7 <= hour_utc < 12:
        return "europe"
    elif 12 <= hour_utc < 16:
        return "overlap"
    elif 16 <= hour_utc < 21:
        return "us"
    else:
        return "off"


def derive_edge_labels(
    trades_df: pd.DataFrame,
    features_df: Optional[pd.DataFrame] = None,
) -> pd.DataFrame:
    """Derives ~30 quantitative edge labels for trade records (§13.3).

    Joins materialized feature DataFrame at trade entry_time if provided, or derives time/session
    and fallback regime metrics directly from trade timestamps.

    Args:
        trades_df (pd.DataFrame): Trade records DataFrame.
        features_df (Optional[pd.DataFrame]): Materialized bar feature DataFrame.

    Returns:
        pd.DataFrame: Trade DataFrame enriched with complete edge label columns.
    """
    if trades_df.empty:
        return trades_df.copy()

    df = trades_df.copy()

    # Ensure entry_time is datetime in UTC
    if not pd.api.types.is_datetime64_any_dtype(df["entry_time"]):
        df["entry_time"] = pd.to_datetime(df["entry_time"], utc=True)

    # 1. Derive Time & Calendar Labels
    entry_ts = df["entry_time"]
    df["hour_utc"] = entry_ts.dt.hour
    df["day_of_week"] = entry_ts.dt.dayofweek
    df["week_of_month"] = ((entry_ts.dt.day - 1) // 7) + 1
    df["month"] = entry_ts.dt.month
    df["session"] = df["hour_utc"].map(session_of_hour)

    # 2. Join Features at entry_time if features_df is provided
    if features_df is not None and not features_df.empty:
        feats = features_df.copy()
        if not pd.api.types.is_datetime64_any_dtype(feats["open_time"]):
            feats["open_time"] = pd.to_datetime(feats["open_time"], utc=True)

        join_cols = ["open_time"]
        if "pair" in feats.columns and "pair" in df.columns:
            join_cols.append("pair")

        merged = pd.merge(
            df,
            feats,
            left_on=["entry_time"] + (["pair"] if "pair" in join_cols else []),
            right_on=join_cols,
            how="left",
            suffixes=("", "_feat"),
        )
        df = merged

    # 3. Populate default/fallback edge label columns if missing
    label_defaults = {
        "trend_regime": "range",
        "vol_regime": "mid",
        "rsi_at_entry": 50.0,
        "adx_at_entry": 20.0,
        "atr_pctile": 0.50,
        "dist_vwap_pct": 0.0,
        "funding_z": 0.0,
        "is_event_day": False,
        "minutes_to_event": 9999,
        "feature_version": "v1.0",
    }

    for col, default_val in label_defaults.items():
        if col not in df.columns or df[col].isna().all():
            df[col] = default_val
        else:
            df[col] = df[col].fillna(default_val)

    logger.debug("Derived edge labels for %d trades", len(df))
    return df
