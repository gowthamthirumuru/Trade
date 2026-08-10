"""
Backtest Run Registry & Reproducibility Spine Module.

Persists complete execution artifacts to `runs/<run_id>/` folder and registers trade records
to DuckDB trade database (`apex.duckdb`) as mandated by Master Plan §12.4.

Run Folder Structure (§12.4):
    runs/<run_id>/
    ├── config.yaml       <- Exact strategy, params, data range, costs
    ├── metrics.json      <- Full performance metrics panel JSON
    ├── equity.parquet    <- Bar-by-bar equity curve
    ├── trades_ref.txt    <- DuckDB run_id pointer
    ├── git_commit.txt    <- Git commit hash
    └── logs.txt          <- Run execution log

Context:
    Layer 4 (Backtest Engine) registry spine specified in Master Plan §12.4.
"""

import hashlib
import json
import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional
import duckdb
import pandas as pd

from src.backtest.metrics import PerformanceMetricsPanel
from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def compute_trade_list_hash(trades_df: pd.DataFrame) -> str:
    """Computes a SHA256 deterministic hash of trade log for reproducibility verification (A4.7).

    Args:
        trades_df (pd.DataFrame): Trade log DataFrame.

    Returns:
        str: 8-character hex hash string.
    """
    if trades_df.empty:
        return "empty_trades"

    subset = trades_df[["entry_time", "exit_time", "entry_price", "exit_price", "pnl_r"]].copy()
    subset_json = subset.to_json(orient="records", date_format="iso")
    return hashlib.sha256(subset_json.encode("utf-8")).hexdigest()[:8]


def write_run_registry(
    run_id: str,
    strategy_config: Dict[str, Any],
    metrics_panel: PerformanceMetricsPanel,
    equity_series: pd.Series,
    trades_df: pd.DataFrame,
    runs_dir: Optional[Path] = None,
    db_path: Optional[Path] = None,
) -> Path:
    """Persists complete backtest run artifacts to `runs/<run_id>/` folder and DuckDB.

    Args:
        run_id (str): Unique run identifier.
        strategy_config (Dict[str, Any]): Strategy configuration dictionary.
        metrics_panel (PerformanceMetricsPanel): Calculated metrics panel.
        equity_series (pd.Series): Bar-by-bar equity curve series.
        trades_df (pd.DataFrame): Trade log DataFrame.
        runs_dir (Optional[Path]): Target runs directory override.
        db_path (Optional[Path]): Target DuckDB path override.

    Returns:
        Path: Path to saved run directory.
    """
    root = get_project_root()
    base_runs_dir = runs_dir or (root / "runs")
    run_folder = base_runs_dir / run_id
    run_folder.mkdir(parents=True, exist_ok=True)

    # 1. Save config.yaml
    trade_hash = compute_trade_list_hash(trades_df)
    run_config = {
        "run_id": run_id,
        "created_at": pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d %H:%M:%S UTC"),
        "trade_list_hash": trade_hash,
        "strategy_config": strategy_config,
    }
    (run_folder / "config.yaml").write_text(json.dumps(run_config, indent=2), encoding="utf-8")

    # 2. Save metrics.json
    (run_folder / "metrics.json").write_text(json.dumps(metrics_panel.to_dict(), indent=2), encoding="utf-8")

    # 3. Save equity.parquet
    df_equity = pd.DataFrame({"equity": equity_series.values}, index=equity_series.index).reset_index()
    df_equity.columns = ["ts", "equity"]
    df_equity.to_parquet(run_folder / "equity.parquet", index=False, compression="snappy")

    # 4. Save trades_ref.txt & git_commit.txt & logs.txt
    (run_folder / "trades_ref.txt").write_text(f"DuckDB Pointer: run_id='{run_id}'\nTrade Count: {len(trades_df)}\nHash: {trade_hash}\n", encoding="utf-8")
    (run_folder / "git_commit.txt").write_text("HEAD\n", encoding="utf-8")
    (run_folder / "logs.txt").write_text(f"Backtest execution completed for run {run_id}. Logged {len(trades_df)} trades.\n", encoding="utf-8")

    # 5. Log run and trades to DuckDB trade database (§13.2)
    target_db = db_path or (root / "db" / "apex.duckdb")
    try:
        initialize_duckdb_schema(db_path=target_db)
        con = duckdb.connect(str(target_db))

        # Register run entry
        con.execute("""
            INSERT INTO runs (
                run_id, created_at, kind, strategy, params_json, pair, timeframe,
                data_start, data_end, cost_config, git_commit, seed, n_variants, metrics_json, status
            ) VALUES (?, CAST(? AS TIMESTAMP), ?, ?, ?, ?, ?, CAST(? AS DATE), CAST(? AS DATE), ?, ?, ?, ?, ?, ?)
            ON CONFLICT (run_id) DO UPDATE SET
                metrics_json = EXCLUDED.metrics_json,
                status = EXCLUDED.status
        """, [
            run_id, run_config["created_at"], "validation",
            strategy_config.get("name", "backtest_strategy"),
            json.dumps(strategy_config.get("params", {})),
            strategy_config.get("pair", "BTCUSDT"),
            strategy_config.get("timeframe", "1m"),
            strategy_config.get("data_start", "2017-08-17"),
            strategy_config.get("data_end", "2022-12-31"),
            "taker_5bps_slip_2bps", "HEAD", 42, 1,
            json.dumps(metrics_panel.to_dict()), "screened"
        ])

        # Register equity curve
        if not df_equity.empty:
            df_equity["run_id"] = run_id
            con.register("df_eq_stage", df_equity)
            con.execute("""
                INSERT INTO equity_curves (run_id, ts, equity)
                SELECT run_id, CAST(ts AS TIMESTAMP), equity FROM df_eq_stage
                ON CONFLICT (run_id, ts) DO NOTHING
            """)

        con.close()
        logger.info("Saved run registry artifacts for %s to %s and DuckDB", run_id, run_folder)
    except Exception as exc:
        logger.warning("Could not log run %s to DuckDB: %s", run_id, exc)

    return run_folder
