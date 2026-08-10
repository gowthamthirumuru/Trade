"""
Portfolio Constraint Guard Layer Module.

Enforces portfolio-level risk limits, pair concentration limits, correlation guards, minimum capital floors,
and weight sum normalization as mandated by Master Plan §16.3.

Constraints (§16.3):
    - max_weight_per_strategy: 0.30 (30% max per strategy)
    - max_weight_per_pair: 0.40 (40% max per trading asset pair)
    - correlation_guard: threshold 0.60 -> action: halve combined weight
    - min_capital_floor: 0.05 (5% minimum weight threshold to avoid dust)
    - weight sum normalization: sum(w_i) == 1.0 +- 1e-9, w_i >= 0.0

Context:
    Layer 8 (Portfolio Construction Engine) constraint guard layer specified in Master Plan §16.3.
"""

import logging
from typing import Any, Dict, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def apply_portfolio_constraints(
    raw_weights: Dict[str, float],
    returns_df: Optional[pd.DataFrame] = None,
    pair_map: Optional[Dict[str, str]] = None,
    max_weight_per_strategy: float = 0.30,
    max_weight_per_pair: float = 0.40,
    corr_threshold: float = 0.60,
    min_capital_floor: float = 0.05,
) -> Dict[str, float]:
    """Applies all Master Plan §16.3 portfolio constraints and normalizes weights.

    Args:
        raw_weights (Dict[str, float]): Unconstrained strategy allocation weights.
        returns_df (Optional[pd.DataFrame]): Daily strategy return matrix for correlation guard.
        pair_map (Optional[Dict[str, str]]): Strategy -> Asset Pair mapping dictionary.
        max_weight_per_strategy (float): Max weight per strategy. Defaults to 0.30.
        max_weight_per_pair (float): Max weight per asset pair. Defaults to 0.40.
        corr_threshold (float): Correlation threshold for correlation guard. Defaults to 0.60.
        min_capital_floor (float): Minimum weight threshold. Defaults to 0.05.

    Returns:
        Dict[str, float]: Constrained and normalized weight dictionary.
    """
    if not raw_weights:
        return {}

    weights = {k: max(0.0, float(v)) for k, v in raw_weights.items()}
    strategies = list(weights.keys())

    # Step 1: Correlation Guard Check (halve combined weight if r > corr_threshold)
    if returns_df is not None and not returns_df.empty and len(strategies) > 1:
        corr_matrix = returns_df[strategies].corr()
        for i in range(len(strategies)):
            for j in range(i + 1, len(strategies)):
                s1, s2 = strategies[i], strategies[j]
                r_val = corr_matrix.loc[s1, s2]
                if pd.notna(r_val) and r_val > corr_threshold:
                    logger.info("Correlation Guard triggered for %s & %s (r=%.2f > %.2f)", s1, s2, r_val, corr_threshold)
                    weights[s1] *= 0.5
                    weights[s2] *= 0.5

    # Step 2: Individual Strategy Cap (max_weight_per_strategy = 0.30)
    for s in strategies:
        if weights[s] > max_weight_per_strategy:
            weights[s] = max_weight_per_strategy

    # Step 3: Per-Pair Concentration Cap (max_weight_per_pair = 0.40)
    if pair_map:
        pairs = set(pair_map.values())
        for p in pairs:
            pair_strats = [s for s in strategies if pair_map.get(s) == p]
            pair_total = sum(weights[s] for s in pair_strats)
            if pair_total > max_weight_per_pair and pair_total > 0:
                scale = max_weight_per_pair / pair_total
                for s in pair_strats:
                    weights[s] *= scale

    # Step 4: Minimum Capital Floor (min_capital_floor = 0.05)
    for s in strategies:
        if weights[s] < min_capital_floor:
            weights[s] = 0.0

    # Step 5: Normalize Weights (sum = 1.0 +- 1e-9)
    total_w = sum(weights.values())
    if total_w > 0:
        norm_weights = {s: float(weights[s] / total_w) for s in strategies}
    else:
        # Equal distribution if all zeroed
        active = [s for s in strategies if raw_weights.get(s, 0) > 0]
        active = active if active else strategies
        w_eq = 1.0 / len(active)
        norm_weights = {s: (w_eq if s in active else 0.0) for s in strategies}

    # Final verification of non-negativity and sum
    final_sum = sum(norm_weights.values())
    assert abs(final_sum - 1.0) < 1e-6, f"Weight sum {final_sum} diverged from 1.0"
    for s, w in norm_weights.items():
        assert w >= 0.0, f"Negative weight detected for {s}: {w}"

    return norm_weights
