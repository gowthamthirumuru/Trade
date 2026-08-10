"""
Analytical Views Access Module.

Provides prebuilt accessors to DuckDB analytical views (`v_strategy_summary`, `v_hourly`, `v_daily`,
`v_session`, `v_regime`) as mandated by Master Plan §13.4.

Context:
    Layer 5 (Trade Database) view query layer specified in Master Plan §13.4.
"""

import logging
from pathlib import Path
from typing import Optional
import duckdb
import pandas as pd

from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def query_view(
    view_name: str,
    strategy: Optional[str] = None,
    pair: Optional[str] = None,
    db_path: Optional[Path] = None,
) -> pd.DataFrame:
    """Queries analytical view with optional filtering on strategy and pair.

    Args:
        view_name (str): View name ('v_strategy_summary', 'v_hourly', 'v_daily', 'v_session', 'v_regime').
        strategy (Optional[str]): Strategy filter.
        pair (Optional[str]): Pair filter.
        db_path (Optional[Path]): DuckDB path override.

    Returns:
        pd.DataFrame: Analytical view result set DataFrame.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    con = duckdb.connect(str(target_db))

    conditions = []
    params = []
    if strategy:
        conditions.append("strategy = ?")
        params.append(strategy)
    if pair:
        conditions.append("pair = ?")
        params.append(pair)

    where_clause = f" WHERE {' AND '.join(conditions)}" if conditions else ""
    sql = f"SELECT * FROM {view_name}{where_clause}"

    df = con.execute(sql, params).fetch_df()
    con.close()
    return df


def get_strategy_summary(strategy: Optional[str] = None, pair: Optional[str] = None, db_path: Optional[Path] = None) -> pd.DataFrame:
    """Returns strategy summary analytics from `v_strategy_summary` view (§13.4)."""
    return query_view("v_strategy_summary", strategy=strategy, pair=pair, db_path=db_path)


def get_hourly_breakdown(strategy: Optional[str] = None, pair: Optional[str] = None, db_path: Optional[Path] = None) -> pd.DataFrame:
    """Returns hourly breakdown analytics from `v_hourly` view (§13.4)."""
    return query_view("v_hourly", strategy=strategy, pair=pair, db_path=db_path)


def get_daily_breakdown(strategy: Optional[str] = None, pair: Optional[str] = None, db_path: Optional[Path] = None) -> pd.DataFrame:
    """Returns daily breakdown analytics from `v_daily` view (§13.4)."""
    return query_view("v_daily", strategy=strategy, pair=pair, db_path=db_path)


def get_session_breakdown(strategy: Optional[str] = None, pair: Optional[str] = None, db_path: Optional[Path] = None) -> pd.DataFrame:
    """Returns session breakdown analytics from `v_session` view (§13.4)."""
    return query_view("v_session", strategy=strategy, pair=pair, db_path=db_path)


def get_regime_breakdown(strategy: Optional[str] = None, pair: Optional[str] = None, db_path: Optional[Path] = None) -> pd.DataFrame:
    """Returns regime breakdown analytics from `v_regime` view (§13.4)."""
    return query_view("v_regime", strategy=strategy, pair=pair, db_path=db_path)
