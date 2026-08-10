"""
Trade Database Access API Layer.

Official contract functions `write_trades()` and `query()` used by downstream modules
and UI command center to execute database operations (§C2.5).

Context:
    Layer 5 (Trade Database) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import duckdb
import pandas as pd

from src.tradesdb.schema import initialize_duckdb_schema
from src.tradesdb.writer import write_trades as internal_write_trades

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def write_trades(
    run_id: str,
    trades_df: pd.DataFrame,
    db_path: Optional[Path] = None,
    features_df: Optional[pd.DataFrame] = None,
) -> int:
    """Writes labeled trade records to DuckDB trades table idempotently (§C2.5).

    Args:
        run_id (str): Unique run identifier string.
        trades_df (pd.DataFrame): Trade log DataFrame.
        db_path (Optional[Path]): DuckDB database path override.
        features_df (Optional[pd.DataFrame]): Feature DataFrame override.

    Returns:
        int: Number of new trade rows written to database.
    """
    return internal_write_trades(run_id, trades_df, db_path=db_path, features_df=features_df)


def query(
    sql: str,
    params: Optional[Any] = None,
    db_path: Optional[Path] = None,
) -> pd.DataFrame:
    """Executes arbitrary analytical SQL query over Trade Database (§C2.5).

    Args:
        sql (str): SQL query string.
        params (Optional[Dict[str, Any]]): Query parameter dictionary.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        pd.DataFrame: SQL result set DataFrame.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    con = duckdb.connect(str(target_db))
    if params:
        df = con.execute(sql, params).fetch_df()
    else:
        df = con.execute(sql).fetch_df()
    con.close()
    return df
