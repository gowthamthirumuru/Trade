"""
DuckDB Database Schema Initialization & Migration Runner Module.

Executes DDL migration scripts from `db/migrations/` to initialize `db/apex.duckdb`.

Context:
    Layer 5 (Trade Database) component specified in Master Plan §13.2 & §21.
"""

import logging
from pathlib import Path
from typing import Optional
import duckdb

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def initialize_duckdb_schema(db_path: Optional[Path] = None, migrations_dir: Optional[Path] = None) -> Path:
    """Initializes DuckDB tables and views by running DDL scripts in db/migrations/.

    Args:
        db_path (Optional[Path]): Target DuckDB database path.
        migrations_dir (Optional[Path]): Directory containing .sql migration scripts.

    Returns:
        Path: Target database path.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    m_dir = migrations_dir or (root / "db" / "migrations")

    target_db.parent.mkdir(parents=True, exist_ok=True)

    sql_files = sorted(m_dir.glob("*.sql"))
    if not sql_files:
        logger.warning("No migration SQL files found in %s", m_dir)
        return target_db

    con = duckdb.connect(str(target_db))
    for sql_file in sql_files:
        logger.info("Executing migration script: %s", sql_file.name)
        sql_content = sql_file.read_text(encoding="utf-8")
        con.execute(sql_content)

    con.close()
    logger.info("DuckDB schema initialized successfully at %s", target_db)
    return target_db
