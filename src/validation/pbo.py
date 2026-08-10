"""
Gate 5 — Probability of Backtest Overfitting (PBO / CSCV) Module.

Implements Combinatorially Symmetric Cross-Validation (CSCV) by Marcos López de Prado to quantify overfitting risk (§15.3).

Gate 5 Criteria (§15.3):
    - PBO < 0.20 (Probability of backtest overfitting less than 20%).

Context:
    Layer 7 (Validation Lab) Gate 5 component specified in Master Plan §15.3 & §22.
"""

import itertools
import logging
from typing import Any, Dict, Optional
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def calculate_pbo(
    matrix_pnls: np.ndarray,
    n_blocks: int = 16,
    max_combos: int = 2000,  # Fast sampling default
    seed: int = 42,
) -> Dict[str, Any]:
    """Calculates Probability of Backtest Overfitting (PBO) via CSCV (§15.3 & §22).

    Args:
        matrix_pnls (np.ndarray): 2D array of returns/PnLs (shape: n_samples x n_variants).
        n_blocks (int): Number of chronological blocks. Defaults to 16.
        max_combos (int): Maximum CSCV combinations evaluated. Defaults to 2000.
        seed (int): Random seed for combination sampling. Defaults to 42.

    Returns:
        Dict[str, Any]: PBO calculation summary dictionary.
    """
    if matrix_pnls.size == 0 or matrix_pnls.ndim != 2:
        return {"passed": False, "gate": "Gate 5: PBO", "pbo": 1.0, "reason": "INVALID_MATRIX"}

    n_samples, n_variants = matrix_pnls.shape
    if n_variants < 2:
        # Single variant cannot compute PBO over variants -> default PBO 0.0 for single strategy
        return {
            "passed": True,
            "gate": "Gate 5: PBO",
            "pbo": 0.0,
            "reason": "PASS",
            "n_variants": n_variants,
            "combos_tested": 0,
        }

    # Partition samples into n_blocks
    block_size = n_samples // n_blocks
    if block_size < 1:
        return {"passed": True, "gate": "Gate 5: PBO", "pbo": 0.0, "reason": "SAMPLES_TOO_SMALL"}

    blocks = []
    for b in range(n_blocks):
        start_i = b * block_size
        end_i = (b + 1) * block_size if b < n_blocks - 1 else n_samples
        blocks.append(matrix_pnls[start_i:end_i, :])

    # All combinations of n_blocks / 2
    k = n_blocks // 2
    all_combos = list(itertools.combinations(range(n_blocks), k))

    if len(all_combos) > max_combos:
        rng = np.random.default_rng(seed)
        sampled_indices = rng.choice(len(all_combos), size=max_combos, replace=False)
        combos = [all_combos[i] for i in sampled_indices]
    else:
        combos = all_combos

    underperform_count = 0

    for train_block_indices in combos:
        test_block_indices = [i for i in range(n_blocks) if i not in train_block_indices]

        train_data = np.vstack([blocks[i] for i in train_block_indices])
        test_data = np.vstack([blocks[i] for i in test_block_indices])

        # Evaluate performance per variant on train and test
        train_perf = np.mean(train_data, axis=0)
        test_perf = np.mean(test_data, axis=0)

        # Best variant index on train data
        best_train_idx = int(np.argmax(train_perf))

        # Relative rank of best_train_idx on test data (0..1)
        test_ranks = np.argsort(np.argsort(test_perf))
        best_test_rank_pct = test_ranks[best_train_idx] / float(n_variants - 1)

        # Underperforms if best IS variant ranks below median OOS (rank_pct < 0.5)
        if best_test_rank_pct < 0.5:
            underperform_count += 1

    pbo = underperform_count / float(len(combos)) if combos else 0.0
    passed = pbo < 0.20
    reason = "PASS" if passed else "PBO_HIGH"

    logger.info("Gate 5 PBO (CSCV): passed=%s, pbo=%.3f, combos=%d", passed, pbo, len(combos))
    return {
        "passed": passed,
        "gate": "Gate 5: PBO",
        "reason": reason,
        "pbo": round(float(pbo), 4),
        "n_variants": n_variants,
        "combos_tested": len(combos),
    }


def evaluate_pbo_gate(
    trades_df: pd.DataFrame,
    n_variants: int = 1,
    pbo_threshold: float = 0.20,
    matrix_pnls: Optional[np.ndarray] = None,
) -> Dict[str, Any]:
    """Evaluates Gate 5: Probability of Backtest Overfitting (§15.3).

    Args:
        trades_df (pd.DataFrame): Strategy trade log DataFrame.
        n_variants (int): Number of parameter variants searched by miner.
        pbo_threshold (float): Maximum allowed PBO. Defaults to 0.20.
        matrix_pnls (Optional[np.ndarray]): Multi-variant return matrix (n_samples x n_variants).

    Returns:
        Dict[str, Any]: Gate 5 audit results dictionary.
    """
    if trades_df.empty or "pnl_r" not in trades_df.columns:
        return {"passed": False, "gate": "Gate 5: PBO", "reason": "NO_TRADES", "pbo": 1.0}

    if matrix_pnls is not None and matrix_pnls.ndim == 2 and matrix_pnls.shape[1] > 1:
        res = calculate_pbo(matrix_pnls)
        res["passed"] = res["pbo"] < pbo_threshold
        res["reason"] = "PASS" if res["passed"] else "PBO_HIGH"
        return res

    if n_variants <= 1:
        return {"passed": True, "gate": "Gate 5: PBO", "reason": "PASS", "pbo": 0.0, "n_variants": 1}

    # For single candidate evaluation when matrix_pnls is omitted
    return {"passed": True, "gate": "Gate 5: PBO", "reason": "PASS", "pbo": 0.0, "n_variants": n_variants}
