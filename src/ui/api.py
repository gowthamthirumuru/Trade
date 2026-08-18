"""Command Center UI Access API Layer.

Official contract function `render_dashboard()` used by downstream modules and execution loop
to access UI state and aggregate page data (§C2.5).

Context:
    Layer 10 (Command Center UI) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional

from src.ui.data_loader import (
    load_data_manager_data,
    load_edge_explorer_data,
    load_journal_data,
    load_miner_data,
    load_overview_data,
    load_portfolio_data,
    load_validation_data,
)
from src.ui.server.services.duckdb_service import DuckDBService

logger = logging.getLogger(__name__)


def run_cli_dashboard(db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Executes full diagnostic load across all functional modules for headless operations."""
    return {
        "page1_overview": load_overview_data(db_path=db_path),
        "page2_miner": load_miner_data(db_path=db_path),
        "page3_edge": load_edge_explorer_data(db_path=db_path),
        "page4_validation": load_validation_data(db_path=db_path),
        "page5_portfolio": load_portfolio_data(db_path=db_path),
        "page6_journal": load_journal_data(db_path=db_path),
        "page7_data": load_data_manager_data(db_path=db_path),
        "quant_edge_overview": DuckDBService(db_path=db_path).get_dashboard_overview().model_dump(),
    }


def render_dashboard(db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Executes data query load for all Command Center views (§C2.5).

    Args:
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Consolidated dictionary of data payloads.
    """
    return run_cli_dashboard(db_path=db_path)
