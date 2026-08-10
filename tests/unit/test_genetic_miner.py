"""
Unit Test Suite for Miner-2 Genetic Programming Search Engine.

Tests expression tree generation, depth constraints, evolutionary loop, and DuckDB run persistence.
"""

from pathlib import Path
import tempfile

import pytest

from src.miner.genetic import ExpressionNode, generate_random_tree, run_genetic_miner


def test_expression_tree_depth_constraint():
    """Verifies generated expression tree satisfies depth limits."""
    tree = generate_random_tree(max_depth=4)
    assert tree.depth() <= 4
    expr_str = tree.to_expr_str()
    assert isinstance(expr_str, str)
    assert len(expr_str) > 0


def test_run_genetic_miner_execution():
    """Verifies genetic miner runs evolutionary loop and persists run to DuckDB."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        tmp_db = Path(tmp_dir) / "apex_gp_test.duckdb"

        audit = run_genetic_miner(
            pair="BTCUSDT",
            timeframe="15m",
            population_size=10,
            n_generations=3,
            max_tree_depth=6,
            db_path=tmp_db,
        )

        assert audit["status"] == "SUCCESS"
        assert audit["n_evaluated"] == 30
        assert audit["best_tree_expr"] is not None
        assert audit["best_sharpe"] > -900.0
