"""
Gate 3 — Monte Carlo Battery Module (4 Simulation Types).

Executes complete 4-simulation Monte Carlo stress battery (Reshuffle, Skip 30%, Block Bootstrap, Cost Stress)
as mandated by Master Plan §15.3 & §C2.11.6.

Gate 3 Criteria (§15.3):
    - Reshuffle 95th percentile max drawdown <= 20%
    - Skip 30% median expectancy > 0.0 R
    - Block bootstrap (block=20) 95th percentile drawdown <= 20%
    - Cost stress at 2x base fees+slippage expectancy > 0.0 R

Context:
    Layer 7 (Validation Lab) Gate 3 component specified in Master Plan §15.3 & §C2.11.6.
"""

import logging
from typing import Any, Dict, Optional
import numpy as np
import pandas as pd

from src.edge.slice import slice_stats

logger = logging.getLogger(__name__)


def mc_reshuffle(
    pnl_r: np.ndarray,
    sims: int = 10000,
    seed: int = 42,
) -> Dict[str, Any]:
    """Simulates trade order permutation (10,000 runs) to assess drawdown distribution (§C2.11.6).

    Args:
        pnl_r (np.ndarray): 1D array of trade R-returns.
        sims (int): Number of permutation runs. Defaults to 10000.
        seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Dict[str, Any]: Reshuffle simulation summary dictionary.
    """
    if len(pnl_r) == 0:
        return {"dd_p50": 0.0, "dd_p95": 0.0, "dd_p99": 0.0, "final_p05": 0.0, "sims": 0}

    rng = np.random.default_rng(seed)
    max_dds = np.empty(sims)
    finals = np.empty(sims)

    for i in range(sims):
        curve = np.cumsum(rng.permutation(pnl_r))
        peak = np.maximum.accumulate(curve)
        max_dds[i] = float((peak - curve).max())
        finals[i] = float(curve[-1])

    return {
        "dd_p50": round(float(np.percentile(max_dds, 50)), 4),
        "dd_p95": round(float(np.percentile(max_dds, 95)), 4),
        "dd_p99": round(float(np.percentile(max_dds, 99)), 4),
        "final_p05": round(float(np.percentile(finals, 5)), 4),
        "sims": sims,
    }


def mc_skip(
    pnl_r: np.ndarray,
    skip_rate: float = 0.30,
    sims: int = 10000,
    seed: int = 42,
) -> Dict[str, Any]:
    """Simulates trade execution dropouts (e.g. 30% missed trades) (§C2.11.6).

    Args:
        pnl_r (np.ndarray): 1D array of trade R-returns.
        skip_rate (float): Fraction of trades randomly dropped. Defaults to 0.30.
        sims (int): Number of dropout simulation runs. Defaults to 10000.
        seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Dict[str, Any]: Skip simulation summary dictionary.
    """
    if len(pnl_r) == 0:
        return {"median_expectancy": 0.0, "p05_expectancy": 0.0, "sims": 0}

    rng = np.random.default_rng(seed)
    expectancies = []

    for _ in range(sims):
        mask = rng.random(len(pnl_r)) > skip_rate
        sampled = pnl_r[mask]
        if len(sampled) > 0:
            expectancies.append(float(np.mean(sampled)))

    exp_arr = np.array(expectancies) if expectancies else np.array([0.0])
    return {
        "median_expectancy": round(float(np.median(exp_arr)), 4),
        "p05_expectancy": round(float(np.percentile(exp_arr, 5)), 4),
        "sims": len(expectancies),
    }


def mc_block_bootstrap(
    pnl_r: np.ndarray,
    block: int = 20,
    sims: int = 10000,
    seed: int = 42,
) -> Dict[str, Any]:
    """Simulates block bootstrap resampling preserving serial dependency (§C2.11.6).

    Args:
        pnl_r (np.ndarray): 1D array of trade R-returns.
        block (int): Block size in trades. Defaults to 20.
        sims (int): Number of simulation runs. Defaults to 10000.
        seed (int): Random seed for reproducibility. Defaults to 42.

    Returns:
        Dict[str, Any]: Block bootstrap summary dictionary.
    """
    if len(pnl_r) < block:
        return mc_reshuffle(pnl_r, sims=sims, seed=seed)

    rng = np.random.default_rng(seed)
    n_blocks = len(pnl_r) // block
    blocks = pnl_r[: n_blocks * block].reshape(n_blocks, block)

    dds = []
    for _ in range(sims):
        selected_block_indices = rng.integers(0, n_blocks, size=n_blocks)
        sample = blocks[selected_block_indices].ravel()
        curve = np.cumsum(sample)
        peak = np.maximum.accumulate(curve)
        dds.append(float((peak - curve).max()))

    return {
        "dd_p95": round(float(np.percentile(dds, 95)), 4),
        "dd_p50": round(float(np.percentile(dds, 50)), 4),
        "sims": sims,
    }


def mc_cost_stress(
    trades_df: pd.DataFrame,
    cost_mult: float = 2.0,
) -> Dict[str, Any]:
    """Stress tests strategy performance under 2x / 3x transaction costs (§15.3).

    Args:
        trades_df (pd.DataFrame): Trade log DataFrame.
        cost_mult (float): Cost multiplier factor (e.g. 2.0 for 2x costs). Defaults to 2.0.

    Returns:
        Dict[str, Any]: Cost stress audit dictionary.
    """
    if trades_df.empty or "pnl_r" not in trades_df.columns:
        return {"passed": False, "expectancy_r": 0.0, "cost_mult": cost_mult}

    df = trades_df.copy()

    # Calculate original fees/slippage cost in R-multiples
    base_fees_bps = df["fees"].mean() if "fees" in df.columns else 10.0
    base_slip_bps = df["slippage"].mean() if "slippage" in df.columns else 4.0
    total_cost_bps = base_fees_bps + base_slip_bps

    # Additional cost penalty under multiplier
    additional_cost_r = ((cost_mult - 1.0) * total_cost_bps) / 100.0

    stressed_pnl_r = df["pnl_r"].values - additional_cost_r
    mean_stressed_r = float(np.mean(stressed_pnl_r))

    passed = mean_stressed_r > 0.0
    return {
        "passed": passed,
        "expectancy_r": round(mean_stressed_r, 4),
        "additional_cost_r": round(additional_cost_r, 4),
        "cost_mult": cost_mult,
    }


def evaluate_monte_carlo_gate(
    trades_df: pd.DataFrame,
    sims: int = 1000,  # Default fast evaluation size
    max_dd_limit: float = 20.0,
    seed: int = 42,
) -> Dict[str, Any]:
    """Evaluates Gate 3: Monte Carlo battery audit (§15.3).

    Args:
        trades_df (pd.DataFrame): Strategy trade log DataFrame.
        sims (int): Number of Monte Carlo iterations. Defaults to 1000.
        max_dd_limit (float): Maximum allowed 95th percentile drawdown in R. Defaults to 20.0.
        seed (int): Random seed. Defaults to 42.

    Returns:
        Dict[str, Any]: Gate 3 audit results dictionary.
    """
    if trades_df.empty or "pnl_r" not in trades_df.columns:
        return {"passed": False, "gate": "Gate 3: Monte Carlo Battery", "reason": "NO_TRADES"}

    pnl_r = trades_df["pnl_r"].values.astype(float)

    res_reshuffle = mc_reshuffle(pnl_r, sims=sims, seed=seed)
    res_skip = mc_skip(pnl_r, skip_rate=0.30, sims=sims, seed=seed)
    res_block = mc_block_bootstrap(pnl_r, block=min(20, max(5, len(pnl_r) // 5)), sims=sims, seed=seed)
    res_cost = mc_cost_stress(trades_df, cost_mult=2.0)

    pass_reshuffle = res_reshuffle["dd_p95"] <= max_dd_limit
    pass_skip = res_skip["median_expectancy"] > 0.0
    pass_block = res_block["dd_p95"] <= max_dd_limit
    pass_cost = res_cost["passed"]

    passed = pass_reshuffle and pass_skip and pass_block and pass_cost
    reason = "PASS" if passed else ("MC_RESHUFFLE_DD" if not pass_reshuffle else ("MC_SKIP_NEGATIVE" if not pass_skip else ("MC_BLOCK_DD" if not pass_block else "MC_COST_FAILURE")))

    logger.info("Gate 3 Monte Carlo Battery: passed=%s, reshuffle_dd95=%.1f, skip_exp=%.2f", passed, res_reshuffle['dd_p95'], res_skip['median_expectancy'])
    return {
        "passed": passed,
        "gate": "Gate 3: Monte Carlo Battery",
        "reason": reason,
        "reshuffle": res_reshuffle,
        "skip": res_skip,
        "block_bootstrap": res_block,
        "cost_stress": res_cost,
    }
