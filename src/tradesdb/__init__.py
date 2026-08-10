"""
Layer 5 Trade Database Module.

DuckDB analytical store for trades, runs, edge cards, and live journal logs.
"""

from src.tradesdb.api import query, write_trades
from src.tradesdb.label import derive_edge_labels
from src.tradesdb.schema import initialize_duckdb_schema

__all__ = [
    "write_trades",
    "query",
    "derive_edge_labels",
    "initialize_duckdb_schema",
]
