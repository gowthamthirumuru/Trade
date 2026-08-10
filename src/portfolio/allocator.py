"""
Portfolio Allocation Engine Module.

Implements Hierarchical Risk Parity (HRP), Inverse-Variance Risk Parity, Mean-CVaR, and Equal-Weight allocation methods
as mandated by Master Plan §16.2.

Context:
    Layer 8 (Portfolio Construction Engine) core allocation algorithms specified in Master Plan §16.2.
"""

import logging
from typing import Any, Dict, Optional
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import leaves_list, linkage
from scipy.spatial.distance import squareform

logger = logging.getLogger(__name__)


def _cov_to_corr(cov: np.ndarray) -> np.ndarray:
    """Converts covariance matrix to correlation matrix."""
    std = np.sqrt(np.diag(cov))
    std[std == 0] = 1e-9
    corr = cov / np.outer(std, std)
    np.fill_diagonal(corr, 1.0)
    return np.clip(corr, -1.0, 1.0)


def _get_quasi_diag(link: np.ndarray) -> list[int]:
    """Sorts cluster linkage to obtain quasi-diagonalized leaf order."""
    return list(leaves_list(link))


def _get_cluster_var(cov: np.ndarray, cluster_items: list[int]) -> float:
    """Computes cluster variance via inverse-variance weighting within cluster."""
    sub_cov = cov[np.ix_(cluster_items, cluster_items)]
    inv_diag = 1.0 / np.maximum(np.diag(sub_cov), 1e-9)
    weights = inv_diag / np.sum(inv_diag)
    return float(np.dot(weights, np.dot(sub_cov, weights)))


def _get_rec_bisection(cov: np.ndarray, sort_idx: list[int]) -> np.ndarray:
    """Computes HRP weights via recursive bisection over quasi-diagonalized items."""
    w = pd.Series(1.0, index=sort_idx)
    cluster_items = [sort_idx]

    while len(cluster_items) > 0:
        cluster_items = [
            i[j:k]
            for i in cluster_items
            for j, k in ((0, len(i) // 2), (len(i) // 2, len(i)))
            if len(i) > 1
        ]
        for i in range(0, len(cluster_items), 2):
            c_items_1 = cluster_items[i]
            c_items_2 = cluster_items[i + 1]

            c_var_1 = _get_cluster_var(cov, c_items_1)
            c_var_2 = _get_cluster_var(cov, c_items_2)

            alpha = 1.0 - c_var_1 / (c_var_1 + c_var_2 + 1e-9)
            w[c_items_1] *= alpha
            w[c_items_2] *= 1.0 - alpha

    return w.values


def hrp_allocation(returns_df: pd.DataFrame) -> Dict[str, float]:
    """Computes Hierarchical Risk Parity (HRP) strategy weights (§16.2).

    Args:
        returns_df (pd.DataFrame): DataFrame of daily strategy returns (cols = strategies).

    Returns:
        Dict[str, float]: Strategy weight dictionary summing to 1.0.
    """
    if returns_df.empty or returns_df.shape[1] == 0:
        return {}

    cols = list(returns_df.columns)
    if len(cols) == 1:
        return {cols[0]: 1.0}

    # Attempt skfolio HRP if available, fallback to scipy implementation
    try:
        from skfolio.optimization import HierarchicalRiskParity
        from skfolio import RiskMeasure

        model = HierarchicalRiskParity(risk_measure=RiskMeasure.VARIANCE)
        model.fit(returns_df)
        weights = model.weights_
        return {cols[i]: float(weights[i]) for i in range(len(cols))}
    except Exception:
        cov = returns_df.cov().values
        corr = _cov_to_corr(cov)

        # Distance matrix D = sqrt(0.5 * (1 - R))
        dist = np.sqrt(np.maximum(0.5 * (1.0 - corr), 0.0))
        np.fill_diagonal(dist, 0.0)

        condensed_dist = squareform(dist, checks=False)
        link = linkage(condensed_dist, method="single")
        sort_idx = _get_quasi_diag(link)

        weights_arr = _get_rec_bisection(cov, sort_idx)
        raw_dict = {cols[sort_idx[i]]: float(weights_arr[i]) for i in range(len(cols))}

        # Ensure order matches columns
        total_w = sum(raw_dict.values())
        return {col: float(raw_dict[col] / total_w) for col in cols}


def risk_parity_allocation(returns_df: pd.DataFrame) -> Dict[str, float]:
    """Computes Inverse-Variance Risk Parity strategy weights (§16.2).

    Args:
        returns_df (pd.DataFrame): DataFrame of daily strategy returns.

    Returns:
        Dict[str, float]: Strategy weight dictionary summing to 1.0.
    """
    if returns_df.empty:
        return {}

    stds = returns_df.std()
    inv_stds = 1.0 / np.maximum(stds.values, 1e-9)
    total_inv = np.sum(inv_stds)

    weights = inv_stds / total_inv
    return {col: float(weights[i]) for i, col in enumerate(returns_df.columns)}


def equal_weight_allocation(returns_df: pd.DataFrame) -> Dict[str, float]:
    """Computes Equal-Weight (1/N) strategy weights (§16.2).

    Args:
        returns_df (pd.DataFrame): DataFrame of daily strategy returns.

    Returns:
        Dict[str, float]: Strategy weight dictionary summing to 1.0.
    """
    if returns_df.empty:
        return {}

    n = len(returns_df.columns)
    w = 1.0 / n
    return {col: float(w) for col in returns_df.columns}


def mean_cvar_allocation(returns_df: pd.DataFrame, alpha: float = 0.05) -> Dict[str, float]:
    """Computes Mean-CVaR tail-risk allocation weights (§16.2).

    Args:
        returns_df (pd.DataFrame): DataFrame of daily strategy returns.
        alpha (float): Significance tail level. Defaults to 0.05.

    Returns:
        Dict[str, float]: Strategy weight dictionary summing to 1.0.
    """
    if returns_df.empty:
        return {}

    cols = list(returns_df.columns)
    if len(cols) == 1:
        return {cols[0]: 1.0}

    # Calculate empirical CVaR per strategy
    cvars = []
    for col in cols:
        series = returns_df[col].dropna().values
        if len(series) > 0:
            var_thresh = np.percentile(series, alpha * 100)
            tail = series[series <= var_thresh]
            cvar = abs(float(np.mean(tail))) if len(tail) > 0 else abs(var_thresh)
        else:
            cvar = 1.0
        cvars.append(max(cvar, 1e-6))

    inv_cvars = 1.0 / np.array(cvars)
    weights = inv_cvars / np.sum(inv_cvars)
    return {col: float(weights[i]) for i, col in enumerate(cols)}
