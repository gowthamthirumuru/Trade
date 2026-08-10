"""
Layer 10 Command Center UI Module.

Streamlit multi-page dashboard, Plotly interactive charts, and high-performance DuckDB data loaders.
"""

from src.ui.api import render_dashboard
from src.ui.data_loader import load_edge_explorer_data, load_overview_data

__all__ = [
    "render_dashboard",
    "load_overview_data",
    "load_edge_explorer_data",
]
