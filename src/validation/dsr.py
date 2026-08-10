"""
Gate 6 — Deflated Sharpe Ratio (DSR) Module.

Calculates Deflated Sharpe Ratio adjusting for non-normality, sample length, and number of variants tried
as mandated by Master Plan §15.3, §22 & §C2.11.

Gate 6 Criteria (§15.3):
    - DSR p-value < 0.05 given n_variants tried in miner.

Context:
    Layer 7 (Validation Lab) Gate 6 component specified in Master Plan §15.3 & §22.
"""

import logging
from typing import Any, Dict
import numpy as np
import pandas as pd
from scipy import stats

logger = logging.getLogger(__name__)

EULER_MASCHERONI = 0.5772156649015329


def expected_max_sharpe(n_variants: int) -> float:
    """Calculates expected maximum Sharpe ratio under zero-edge H0 across N trials (§22).

    Args:
        n_variants (int): Number of strategy variants tested by miner.

    Returns:
        float: Expected max Sharpe ratio value.
    """
    if n_variants <= 1:
        return 0.0

    ln_n = np.log(n_variants)
    z = np.sqrt(2.0 * ln_n)
    return float(z + (EULER_MASCHERONI / z))


def calculate_dsr(
    observed_sr: float,
    n_variants: int,
    n_samples: int,
    skew: float = 0.0,
    kurtosis: float = 3.0,
    annualization_factor: float = 365.0,
) -> Dict[str, Any]:
    """Calculates Deflated Sharpe Ratio and p-value per Bailey & López de Prado (2014) (§15.3 & §22).

    Args:
        observed_sr (float): Observed annualized Sharpe Ratio.
        n_variants (int): Number of variants tested (miner trial accounting).
        n_samples (int): Sample size T (number of daily return observations).
        skew (float): Return skewness. Defaults to 0.0.
        kurtosis (float): Return kurtosis (excess kurtosis + 3). Defaults to 3.0.
        annualization_factor (float): Crypto annualization factor. Defaults to 365.0.

    Returns:
        Dict[str, Any]: DSR evaluation dictionary ('dsr', 'p_value', 'emax_sr', 'passed').
    """
    if n_samples < 2:
        return {"passed": False, "dsr": 0.0, "p_value": 1.0, "emax_sr": 0.0, "reason": "SAMPLES_TOO_SMALL"}

    # Convert annualized Sharpe to per-period Sharpe
    period_sr = observed_sr / np.sqrt(annualization_factor)

    # Expected max Sharpe under H0 per period
    emax_period_sr = expected_max_sharpe(n_variants) / np.sqrt(annualization_factor)

    # Standard error variance denominator adjustment for non-normality
    sr_var = 1.0 - (skew * period_sr) + (((kurtosis - 1.0) / 4.0) * (period_sr ** 2))
    sr_std_err = np.sqrt(max(sr_var, 1e-9) / (n_samples - 1.0))

    # Test statistic z
    z_stat = (period_sr - emax_period_sr) / max(sr_std_err, 1e-9)
    dsr_cdf = float(stats.norm.cdf(z_stat))
    p_value = float(1.0 - dsr_cdf)

    passed = (dsr_cdf > 0.5) and (p_value < 0.05)
    reason = "PASS" if passed else ("DSR_SR_LOW" if observed_sr <= 0 else "DSR_PVAL_HIGH")

    logger.info("Gate 6 DSR: passed=%s, SR=%.2f, N_vars=%d, P-val=%.4f", passed, observed_sr, n_variants, p_value)
    return {
        "passed": passed,
        "dsr": round(dsr_cdf, 4),
        "p_value": round(p_value, 6),
        "z_stat": round(float(z_stat), 4),
        "emax_sr": round(float(emax_period_sr * np.sqrt(annualization_factor)), 4),
        "observed_sr": round(observed_sr, 4),
        "n_variants": n_variants,
        "reason": reason,
    }


def evaluate_dsr_gate(
    observed_sr: float,
    n_variants: int,
    n_samples: int = 365,
    skew: float = 0.0,
    kurtosis: float = 3.0,
) -> Dict[str, Any]:
    """Evaluates Gate 6: Deflated Sharpe Ratio check (§15.3).

    Args:
        observed_sr (float): Strategy observed Sharpe Ratio.
        n_variants (int): Miner trial count.
        n_samples (int): Sample size. Defaults to 365.
        skew (float): Return skewness.
        kurtosis (float): Return kurtosis.

    Returns:
        Dict[str, Any]: Gate 6 audit results dictionary.
    """
    res = calculate_dsr(observed_sr, n_variants, n_samples, skew=skew, kurtosis=kurtosis)
    res["gate"] = "Gate 6: Deflated Sharpe Ratio"
    return res
