"""
Time & UTC Session Feature Generator Module.

Computes time-based calendar features and UTC session labels as specified in Master Plan §10.2 & §C2.1.2.

UTC Session Definitions (§C2.1.2):
    - 'asia'    : 00:00 - 07:00 UTC (Hours 0, 1, 2, 3, 4, 5, 6)
    - 'europe'  : 07:00 - 12:00 UTC (Hours 7, 8, 9, 10, 11)
    - 'overlap' : 12:00 - 16:00 UTC (Hours 12, 13, 14, 15)  [Europe/US Overlap]
    - 'us'      : 16:00 - 21:00 UTC (Hours 16, 17, 18, 19, 20)
    - 'off'     : 21:00 - 24:00 UTC (Hours 21, 22, 23)

Context:
    Layer 2 (Feature Factory) component specified in Master Plan §10.2 & §C2.1.2.
"""

import logging
from typing import Dict
import pandas as pd

logger = logging.getLogger(__name__)

# Hour UTC mapping to session category string (§C2.1.2)
HOUR_SESSION_MAP: Dict[int, str] = {
    0: "asia", 1: "asia", 2: "asia", 3: "asia", 4: "asia", 5: "asia", 6: "asia",
    7: "europe", 8: "europe", 9: "europe", 10: "europe", 11: "europe",
    12: "overlap", 13: "overlap", 14: "overlap", 15: "overlap",
    16: "us", 17: "us", 18: "us", 19: "us", 20: "us",
    21: "off", 22: "off", 23: "off",
}

# Session start hours (used for computing minutes_from_session_open)
SESSION_START_HOURS: Dict[str, int] = {
    "asia": 0,
    "europe": 7,
    "overlap": 12,
    "us": 16,
    "off": 21,
}


def classify_session_hour(hour_utc: int) -> str:
    """Classifies a UTC hour into its corresponding session category string.

    Args:
        hour_utc (int): Hour integer between 0 and 23.

    Returns:
        str: Session label ('asia', 'europe', 'overlap', 'us', 'off').
    """
    return HOUR_SESSION_MAP.get(hour_utc, "off")


def compute_time_and_session_features(open_time_series: pd.Series) -> pd.DataFrame:
    """Computes full set of calendar, time, and session features for an open_time series.

    Args:
        open_time_series (pd.Series): UTC datetime series of bar open times.

    Returns:
        pd.DataFrame: DataFrame containing all time and session columns:
            - hour_utc (int: 0..23)
            - day_of_week (int: 0..6, Mon=0)
            - is_weekend (bool)
            - week_of_month (int: 1..5)
            - month (int: 1..12)
            - quarter (int: 1..4)
            - session (str: 'asia'|'europe'|'overlap'|'us'|'off')
            - minutes_from_session_open (int)
    """
    dt_series = pd.to_datetime(open_time_series, utc=True)
    df_time = pd.DataFrame(index=open_time_series.index)

    df_time["hour_utc"] = dt_series.dt.hour
    df_time["day_of_week"] = dt_series.dt.dayofweek
    df_time["is_weekend"] = df_time["day_of_week"].isin([5, 6])
    df_time["week_of_month"] = (dt_series.dt.day - 1) // 7 + 1
    df_time["month"] = dt_series.dt.month
    df_time["quarter"] = dt_series.dt.quarter

    # Map session labels
    df_time["session"] = df_time["hour_utc"].map(HOUR_SESSION_MAP)

    # Compute minutes elapsed from current session start
    session_start_hour = df_time["session"].map(SESSION_START_HOURS)
    session_start_dt = dt_series.dt.floor("D") + pd.to_timedelta(session_start_hour, unit="h")

    df_time["minutes_from_session_open"] = ((dt_series - session_start_dt).dt.total_seconds() / 60.0).astype(int)

    return df_time
