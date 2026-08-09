"""
Strategy Miner Governance & Data Wall Enforcement Module.

Enforces critical architecture rules (§6.2 & §11.6):
    1. Data Wall: Miner process is physically barred from accessing post-2022 bars.
    2. Trial Budget Accounting: Logs total `n_variants_tested` to feed Gate 6 (Deflated Sharpe Ratio).
    3. Run Registration: Registers every run to `runs/` directory and DuckDB `runs` table.

Context:
    Layer 3 (Strategy Miner) governance component specified in Master Plan §6.2 & §11.6.
"""

import hashlib
import json
import logging
from pathlib import Path
import platform
import time
from typing import Any, Dict, Optional

import duckdb
import pandas as pd

logger = logging.getLogger(__name__)

# Hard architectural boundary date (§6.2)
RESEARCH_WALL_END_DATE: str = "2022-12-31"


class DataWallViolationError(PermissionError):
    """Raised when miner attempts to load post-2022 data."""

    pass


def verify_data_wall(start_date: str, end_date: str) -> None:
    """Enforces the one-way research wall (§6.2).

    Raises DataWallViolationError if end_date extends past '2022-12-31'.

    Args:
        start_date (str): Search start date ('YYYY-MM-DD').
        end_date (str): Search end date ('YYYY-MM-DD').

    Raises:
        DataWallViolationError: If end_date > '2022-12-31'.
    """
    end_ts = pd.Timestamp(end_date)
    wall_ts = pd.Timestamp(RESEARCH_WALL_END_DATE)

    if end_ts > wall_ts:
        raise DataWallViolationError(
            f"CRITICAL RESEARCH WALL VIOLATION! Miner process attempted to load data ending at {end_date}, "
            f"which exceeds the In-Sample research wall date '{RESEARCH_WALL_END_DATE}'. "
            f"Post-2022 data is strictly reserved for the Validation Lab (Gate 1 OOS)."
        )


def register_mining_run(
    run_id: str,
    strategy_name: str,
    params_dict: Dict[str, Any],
    pair: str,
    timeframe: str,
    data_start: str,
    data_end: str,
    n_variants_tested: int,
    status: str = "screened",
    db_path: Optional[Path] = None,
    runs_dir: Optional[Path] = None,
) -> Path:
    """Registers a mining run to local `runs/<run_id>/` folder and DuckDB `runs` table.

    Args:
        run_id (str): Unique run identifier (e.g. '2026-08-09_stage2_momo_a7f3').
        strategy_name (str): Candidate strategy name.
        params_dict (Dict[str, Any]): Parameters dictionary.
        pair (str): Trading pair identifier.
        timeframe (str): Timeframe.
        data_start (str): In-sample start date.
        data_end (str): In-sample end date.
        n_variants_tested (int): Total number of variants evaluated in this run (for DSR).
        status (str): Run status ('screened', 'validated', 'killed').
        db_path (Optional[Path]): DuckDB database path.
        runs_dir (Optional[Path]): Runs root directory.

    Returns:
        Path: Path to saved run directory.
    """
    # Enforce data wall
    verify_data_wall(data_start, data_end)

    root = Path(__file__).parent.parent.parent
    r_dir = runs_dir or (root / "runs")
    run_folder = r_dir / run_id
    run_folder.mkdir(parents=True, exist_ok=True)

    config_hash = hashlib.sha256(json.dumps(params_dict, sort_keys=True).encode("utf-8")).hexdigest()[:8]
    created_at = pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d %H:%M:%S")

    run_meta = {
        "run_id": run_id,
        "created_at": created_at,
        "kind": "miner1",
        "strategy": strategy_name,
        "params": params_dict,
        "pair": pair,
        "timeframe": timeframe,
        "data_start": data_start,
        "data_end": data_end,
        "config_hash": config_hash,
        "n_variants_tested": n_variants_tested,
        "machine": platform.node(),
        "status": status,
    }

    # Save to disk
    (run_folder / "config.yaml").write_text(json.dumps(run_meta, indent=2), encoding="utf-8")
    (run_folder / "logs.txt").write_text(f"Registered mining run {run_id} with {n_variants_tested} variants tested.\n", encoding="utf-8")

    # Register in DuckDB database if available
    target_db = db_path or (root / "db" / "apex.duckdb")
    try:
        from src.tradesdb.schema import initialize_duckdb_schema
        initialize_duckdb_schema(db_path=target_db)

        con = duckdb.connect(str(target_db))
        con.execute("""
            INSERT INTO runs (
                run_id, created_at, kind, strategy, params_json, pair, timeframe,
                data_start, data_end, cost_config, git_commit, seed, n_variants, metrics_json, status
            ) VALUES (?, CAST(? AS TIMESTAMP), ?, ?, ?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, ?, ?, ?, ?, ?)
            ON CONFLICT (run_id) DO UPDATE SET
                n_variants = EXCLUDED.n_variants,
                status = EXCLUDED.status
        """, [
            run_id, created_at, "miner1", strategy_name, json.dumps(params_dict),
            pair, timeframe, data_start, data_end, "taker_5bps_slip_2bps",
            "HEAD", 42, n_variants_tested, json.dumps({"n_variants": n_variants_tested}), status
        ])
        con.close()
        logger.info("Registered mining run %s to DuckDB runs table", run_id)
    except Exception as exc:
        logger.warning("Could not write run %s to DuckDB: %s", run_id, exc)

    return run_folder
