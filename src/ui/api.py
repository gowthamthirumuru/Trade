"""
Command Center UI Access API Layer.

Official contract function `render_dashboard()` used by downstream modules and execution loop
to access UI state and aggregate page data (§C2.5).

Context:
    Layer 10 (Command Center UI) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional

from src.ui.app import run_cli_dashboard
from src.ui.data_loader import (
    load_data_manager_data,
    load_edge_explorer_data,
    load_journal_data,
    load_miner_data,
    load_overview_data,
    load_portfolio_data,
    load_validation_data,
)

logger = logging.getLogger(__name__)


def render_dashboard(db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Executes data query load for all 7 Command Center pages (§C2.5).

    Args:
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Consolidated dictionary of data payloads across all 7 pages.
    """
    return run_cli_dashboard(db_path=db_path)
