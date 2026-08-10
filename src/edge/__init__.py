"""
Layer 6 Edge Analytics Engine Module.

SQL slicing, statistical significance testing, false-positive control, and Edge Card generation.
"""

from src.edge.api import make_edge_card, scan_dimensions, slice_stats
from src.edge.cards import expire_cards, get_edge_card
from src.edge.significance import bh_adjust, check_both_halves_stability

__all__ = [
    "slice_stats",
    "scan_dimensions",
    "make_edge_card",
    "bh_adjust",
    "check_both_halves_stability",
    "get_edge_card",
    "expire_cards",
]
