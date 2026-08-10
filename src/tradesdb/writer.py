"""
Trade Database Writer Module.

Idempotently persists labeled trade records to DuckDB `trades` table as mandated by Master Plan §13.3 & §C2.11.3.

Rules (§13.3):
    - Derives edge labels via `derive_edge_labels()`
    - Idempotent upsert (`ON CONFLICT (trade_id) DO NOTHING`)
    - Re-writing identical trade log returns 0 inserted rows.

Context:
    Layer 5 (Trade Database) writer component specified in Master Plan §13.3.
"""

import hashlib
import logging
from pathlib import Path
from typing import Any, Optional
import duckdb
import pandas as pd

from src.tradesdb.label import derive_edge_labels
from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def generate_deterministic_trade_id(run_id: str, index: int, entry_time: Any, pair: str) -> int:
    """Generates a deterministic positive 64-bit integer trade_id from run details.

    Args:
        run_id (str): Run identifier string.
        index (int): Trade index.
        entry_time (Any): Entry timestamp value.
        pair (str): Pair symbol.

    Returns:
        int: Deterministic positive 64-bit integer trade_id.
    """
    raw_str = f"{run_id}_{index}_{entry_time}_{pair}"
    hash_hex = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()[:15]
    return int(hash_hex, 16)


def write_trades(
    run_id: str,
    trades_df: pd.DataFrame,
    db_path: Optional[Path] = None,
    features_df: Optional[pd.DataFrame] = None,
) -> int:
    """Writes labeled trade records to DuckDB trades table idempotently (§13.3).

    Args:
        run_id (str): Unique run identifier.
        trades_df (pd.DataFrame): Trade records DataFrame.
        db_path (Optional[Path]): DuckDB database path override.
        features_df (Optional[Path]): Feature DataFrame for edge label derivation.

    Returns:
        int: Number of new trade rows inserted into database.
    """
    if trades_df.empty:
        return 0

    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")

    # Initialize DuckDB schema if not present
    initialize_duckdb_schema(db_path=target_db)

    # 1. Derive edge labels
    df = derive_edge_labels(trades_df, features_df)
    df["run_id"] = run_id

    # 2. Ensure trade_id is integer and unique per run
    if "trade_id" not in df.columns or df["trade_id"].isna().any():
        df["trade_id"] = [
            generate_deterministic_trade_id(run_id, i, row.get("entry_time"), row.get("pair", "BTCUSDT"))
            for i, row in df.iterrows()
        ]
    else:
        # Convert existing trade_id to deterministic numeric if needed
        df["trade_id"] = df["trade_id"].apply(
            lambda tid: int(tid) if isinstance(tid, (int, float)) and not pd.isna(tid)
            else generate_deterministic_trade_id(run_id, 0, str(tid), "BTCUSDT")
        )

    # Required column order matching DuckDB schema
    required_cols = [
        "trade_id", "run_id", "strategy", "pair", "timeframe", "direction",
        "entry_time", "exit_time", "entry_price", "exit_price", "qty",
        "pnl_quote", "pnl_pct", "pnl_r", "fees", "slippage", "mae_pct", "mfe_pct",
        "bars_held", "exit_reason", "source", "hour_utc", "day_of_week",
        "week_of_month", "month", "session", "trend_regime", "vol_regime",
        "rsi_at_entry", "adx_at_entry", "atr_pctile", "dist_vwap_pct",
        "funding_z", "is_event_day", "minutes_to_event", "feature_version"
    ]

    for col in required_cols:
        if col not in df.columns:
            df[col] = None

    df_stage = df[required_cols].copy()

    con = duckdb.connect(str(target_db))
    # Ensure run_id exists in runs table to satisfy Foreign Key constraint
    con.execute("""
        INSERT INTO runs (run_id, created_at, kind, strategy, status)
        VALUES (?, CURRENT_TIMESTAMP, 'backtest', 'auto_registered', 'screened')
        ON CONFLICT (run_id) DO NOTHING
    """, [run_id])

    count_before = con.execute("SELECT COUNT(*) FROM trades").fetchone()[0]

    con.register("df_stage", df_stage)
    con.execute("""
        INSERT INTO trades BY NAME
        SELECT * FROM df_stage
        ON CONFLICT (trade_id) DO NOTHING
    """)

    count_after = con.execute("SELECT COUNT(*) FROM trades").fetchone()[0]
    con.close()

    inserted_count = count_after - count_before
    logger.info("Wrote %d new trades for run %s to DuckDB trades table", inserted_count, run_id)
    return inserted_count
