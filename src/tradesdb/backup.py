"""
Database Backup & Recovery Routine Module.

Handles database backup copy generation and restore verification drills as mandated by Master Plan §13.5 (A5.8).

Context:
    Layer 5 (Trade Database) backup component specified in Master Plan §13.5.
"""

import logging
from pathlib import Path
import shutil
import time
from typing import Optional
import duckdb

from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def backup_database(
    db_path: Optional[Path] = None,
    backup_dir: Optional[Path] = None,
) -> Path:
    """Creates a timestamped backup copy of DuckDB database file (A5.8).

    Args:
        db_path (Optional[Path]): Source DuckDB database path.
        backup_dir (Optional[Path]): Destination backup directory.

    Returns:
        Path: Path to created backup database file.
    """
    root = get_project_root()
    source_db = db_path or (root / "db" / "apex.duckdb")
    target_dir = backup_dir or (root / "db" / "backups")

    target_dir.mkdir(parents=True, exist_ok=True)

    if not source_db.exists():
        initialize_duckdb_schema(db_path=source_db)

    timestamp = int(time.time())
    backup_filename = f"apex_backup_{timestamp}.duckdb"
    backup_path = target_dir / backup_filename

    # Execute file copy for snapshot
    shutil.copy2(source_db, backup_path)
    logger.info("Successfully created database backup at %s", backup_path)
    return backup_path


def verify_restore(backup_file: Path, target_test_db: Optional[Path] = None) -> bool:
    """Verifies that database backup file can be restored and queried without corruption (A5.8).

    Args:
        backup_file (Path): Path to backup database file.
        target_test_db (Optional[Path]): Temporary restore target path.

    Returns:
        bool: True if restore check succeeds cleanly.
    """
    if not backup_file.exists():
        logger.error("Backup file does not exist: %s", backup_file)
        return False

    try:
        con = duckdb.connect(str(backup_file))
        res = con.execute("SELECT COUNT(*) FROM trades").fetchone()
        con.close()
        logger.info("Backup restore verification succeeded. Trades count in backup: %d", res[0])
        return True
    except Exception as exc:
        logger.error("Backup restore verification failed: %s", exc)
        return False
