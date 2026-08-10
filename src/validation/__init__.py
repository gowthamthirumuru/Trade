"""
Layer 7 Validation Lab Module.

Anti-overfitting gauntlet (OOS, Walk-Forward, Monte Carlo, Regime Stress, PBO, DSR).
"""

from src.validation.api import run_gauntlet
from src.validation.dsr import calculate_dsr
from src.validation.pbo import calculate_pbo
from src.validation.walkforward import walk_forward

__all__ = [
    "run_gauntlet",
    "walk_forward",
    "calculate_pbo",
    "calculate_dsr",
]
