"""
Statistical Significance & Multiple-Testing Correction Module.

Enforces anti-self-deception protocols using Benjamini–Hochberg FDR multiple-testing corrections,
both-halves in-sample stability checks, and control simulations (§14.2 & §C2.11.5).

Rules (§14.2):
    - Benjamini–Hochberg FDR adjustment at q=0.05
    - Both-halves stability: slice must be profitable (E[R] > 0) in BOTH halves of chronological data.
    - Negative control: random noise produces ~0 passing cards.
    - Positive control: synthetic planted edge is detected.

Context:
    Layer 6 (Edge Analytics Engine) significance layer specified in Master Plan §14.2 & §C2.11.5.
"""

import logging
from typing import Any, Dict
import numpy as np
import pandas as pd

from src.edge.slice import slice_stats

logger = logging.getLogger(__name__)


def bh_adjust(scan_df: pd.DataFrame, q: float = 0.05) -> pd.DataFrame:
    """Applies Benjamini–Hochberg False Discovery Rate (FDR) adjustment (§C2.11.5).

    Args:
        scan_df (pd.DataFrame): DataFrame containing 'p_value' column.
        q (float): False discovery rate limit. Defaults to 0.05.

    Returns:
        pd.DataFrame: DataFrame enriched with 'bh_threshold', 'p_adj', and 'significant' columns.
    """
    if scan_df.empty or "p_value" not in scan_df.columns:
        return scan_df.copy()

    df = scan_df.sort_values("p_value").reset_index(drop=True)
    m = len(df)

    df["bh_threshold"] = (df.index + 1) / m * q

    # Calculate adjusted p-values (p_adj = min(p * m / rank, 1))
    ranks = np.arange(1, m + 1)
    p_raw = df["p_value"].values
    p_adj = np.minimum(1.0, p_raw * m / ranks)

    # Monotonicity adjustment (cumulative minimum from right)
    p_adj = np.minimum.accumulate(p_adj[::-1])[::-1]
    df["p_adj"] = np.round(p_adj, 6)

    df["significant"] = df["p_value"] <= df["bh_threshold"]

    # Enforce monotonicity: significance cut at last passing index
    if df["significant"].any():
        cut = df.index[df["significant"]].max()
        df["significant"] = df.index <= cut

    return df.sort_index()


def check_both_halves_stability(df: pd.DataFrame) -> Dict[str, Any]:
    """Enforces in-sample stability by checking profitability in both chronological halves (§14.2 & A6.5).

    Args:
        df (pd.DataFrame): Trade slice DataFrame.

    Returns:
        Dict[str, Any]: Stability audit dictionary ('stable', 'half1_exp_r', 'half2_exp_r').
    """
    if len(df) < 10:
        return {"stable": False, "half1_exp_r": 0.0, "half2_exp_r": 0.0}

    df_sorted = df.sort_values("entry_time") if "entry_time" in df.columns else df
    mid = len(df_sorted) // 2

    h1 = df_sorted.iloc[:mid]
    h2 = df_sorted.iloc[mid:]

    stats1 = slice_stats(h1, min_n=5)
    stats2 = slice_stats(h2, min_n=5)

    exp1 = stats1["expectancy_r"]
    exp2 = stats2["expectancy_r"]

    is_stable = (exp1 > 0.0) and (exp2 > 0.0)

    return {
        "stable": is_stable,
        "half1_exp_r": exp1,
        "half2_exp_r": exp2,
        "half1_n": stats1["n"],
        "half2_n": stats2["n"],
    }


def run_negative_control_test(
    n_trades: int = 5000,
    seed: int = 42,
) -> Dict[str, Any]:
    """Runs negative-control simulation over synthetic zero-mean random noise (A6.3 & §C2.6.4).

    Asserts that Benjamini–Hochberg FDR control limits false positive edge discoveries to ~0.

    Args:
        n_trades (int): Number of synthetic noise trades. Defaults to 5000.
        seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Dict[str, Any]: Negative control test report.
    """
    rng = np.random.default_rng(seed)
    noise_r = rng.normal(0.0, 1.0, n_trades)
    hours = rng.integers(0, 24, n_trades)
    days = rng.integers(0, 7, n_trades)

    df_noise = pd.DataFrame({
        "pnl_r": noise_r,
        "hour_utc": hours,
        "day_of_week": days,
    })

    from src.edge.scan import scan_dimensions
    scan_res = scan_dimensions(df_noise, ["hour_utc", "day_of_week"], min_n=20)
    adjusted = bh_adjust(scan_res, q=0.05)

    significant_count = int(adjusted["significant"].sum()) if not adjusted.empty and "significant" in adjusted.columns else 0
    passed_control = significant_count == 0

    return {
        "passed": passed_control,
        "total_slices_tested": len(scan_res),
        "false_positives_detected": significant_count,
        "status": "NEGATIVE CONTROL PASS" if passed_control else "FALSE POSITIVE LEAKAGE DETECTED",
    }


def run_positive_control_test(
    n_trades: int = 5000,
    planted_day: int = 2,  # Wednesday = 2
    planted_edge_r: float = 0.25,
    seed: int = 42,
) -> Dict[str, Any]:
    """Runs positive-control simulation with a synthetic planted edge (A6.4 & §C2.6.5).

    Verifies that the edge engine correctly discovers and surfaces the planted dimension edge.

    Args:
        n_trades (int): Number of synthetic trades. Defaults to 5000.
        planted_day (int): Target day of week for planted edge. Defaults to 2 (Wed).
        planted_edge_r (float): Planted mean R return boost. Defaults to 0.25.
        seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Dict[str, Any]: Positive control test report.
    """
    rng = np.random.default_rng(seed)
    noise_r = rng.normal(0.0, 1.0, n_trades)
    days = rng.integers(0, 7, n_trades)

    # Inject artificial boost on Wednesday trades
    noise_r[days == planted_day] += planted_edge_r

    df_planted = pd.DataFrame({
        "pnl_r": noise_r,
        "day_of_week": days,
    })

    from src.edge.scan import scan_dimensions
    scan_res = scan_dimensions(df_planted, ["day_of_week"], min_n=20)
    adjusted = bh_adjust(scan_res, q=0.05)

    top_slice = adjusted.iloc[0] if not adjusted.empty else None
    found_planted = top_slice is not None and top_slice.get("day_of_week") == planted_day and top_slice.get("significant", False)

    return {
        "passed": bool(found_planted),
        "detected_day": int(top_slice.get("day_of_week")) if top_slice is not None else None,
        "expectancy_r": float(top_slice.get("expectancy_r")) if top_slice is not None else 0.0,
        "p_adj": float(top_slice.get("p_adj")) if top_slice is not None else 1.0,
        "status": "POSITIVE CONTROL PASS" if found_planted else "PLANTED EDGE NOT DETECTED",
    }
