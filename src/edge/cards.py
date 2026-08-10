"""
Edge Card Generator & Maintenance Routine Module.

Manages Edge Card CRUD operations, DuckDB `edge_cards` persistence, and 90-day auto-expiry maintenance
as mandated by Master Plan §14.2, §C2.9.3 & A6.7.

Context:
    Layer 6 (Edge Analytics Engine) cards component specified in Master Plan §14.2 & §C2.9.3.
"""

import hashlib
import json
import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional
import duckdb
import pandas as pd

from src.edge.significance import bh_adjust, check_both_halves_stability
from src.edge.slice import slice_stats
from src.tradesdb.api import query
from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def generate_deterministic_card_id(strategy: str, filter_dict: Dict[str, Any]) -> int:
    """Generates a deterministic positive integer card_id from strategy and filter config."""
    raw_str = f"{strategy}_{json.dumps(filter_dict, sort_keys=True)}"
    hash_hex = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()[:12]
    return int(hash_hex, 16)


def make_edge_card(
    strategy: str,
    filter_dict: Dict[str, Any],
    trades_df: Optional[pd.DataFrame] = None,
    db_path: Optional[Path] = None,
) -> int:
    """Generates and persists an Edge Card to DuckDB edge_cards table (§14.2 & §C2.5).

    Args:
        strategy (str): Strategy identifier string.
        filter_dict (Dict[str, Any]): Filter slice condition dictionary (e.g. {'session': 'europe', 'day_of_week': 2}).
        trades_df (Optional[pd.DataFrame]): Trade log DataFrame override.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        int: Generated card_id integer.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    # Fetch trades from DuckDB if not provided
    if trades_df is None or trades_df.empty:
        df_trades = query("SELECT * FROM trades WHERE strategy = ?", [strategy], db_path=target_db)
    else:
        df_trades = trades_df.copy()

    # Apply filter_dict conditions
    filtered_df = df_trades.copy()
    if not filtered_df.empty and filter_dict:
        for col, val in filter_dict.items():
            if col in filtered_df.columns:
                if isinstance(val, list):
                    filtered_df = filtered_df[filtered_df[col].isin(val)]
                else:
                    filtered_df = filtered_df[filtered_df[col] == val]

    # Calculate slice statistics
    stats = slice_stats(filtered_df, min_n=10)
    stability = check_both_halves_stability(filtered_df)

    card_id = generate_deterministic_card_id(strategy, filter_dict)
    pair = str(filter_dict.get("pair", df_trades.get("pair", pd.Series(["BTCUSDT"])).iloc[0] if not df_trades.empty else "BTCUSDT"))

    # Determine status: active (n >= 100, both halves stable, p <= 0.05), provisional (n >= 50), or retired
    is_in_sample_ok = bool(stats["n"] >= 50 and stats["expectancy_r"] > 0)
    is_oos_ok = bool(stability["stable"])

    if stats["n"] >= 100 and stability["stable"] and stats["p_value"] <= 0.05:
        status = "active"
    elif stats["n"] >= 50:
        status = "provisional"
    else:
        status = "provisional"

    now_ts = pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d %H:%M:%S UTC")

    con = duckdb.connect(str(target_db))
    con.execute("""
        INSERT INTO edge_cards (
            card_id, strategy, pair, filter_json, n_trades, expectancy_r, win_rate,
            profit_factor, sharpe, in_sample_ok, oos_ok, p_value, status, created_at, last_validated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS TIMESTAMP), CAST(? AS TIMESTAMP))
        ON CONFLICT (card_id) DO UPDATE SET
            n_trades = EXCLUDED.n_trades,
            expectancy_r = EXCLUDED.expectancy_r,
            win_rate = EXCLUDED.win_rate,
            profit_factor = EXCLUDED.profit_factor,
            sharpe = EXCLUDED.sharpe,
            in_sample_ok = EXCLUDED.in_sample_ok,
            oos_ok = EXCLUDED.oos_ok,
            p_value = EXCLUDED.p_value,
            status = EXCLUDED.status,
            last_validated = EXCLUDED.last_validated
    """, [
        card_id, strategy, pair, json.dumps(filter_dict), stats["n"],
        stats["expectancy_r"], stats["win_rate"], stats["profit_factor"],
        stats["t_stat"], is_in_sample_ok, is_oos_ok, stats["p_value"],
        status, now_ts, now_ts
    ])
    con.close()

    logger.info("Generated Edge Card #%d for strategy %s: status=%s, n=%d, exp=%.2fR", card_id, strategy, status, stats["n"], stats["expectancy_r"])
    return card_id


def get_edge_card(card_id: int, db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Retrieves Edge Card record dictionary from DuckDB.

    Args:
        card_id (int): Edge Card identifier integer.
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Edge Card dictionary.
    """
    df = query("SELECT * FROM edge_cards WHERE card_id = ?", [card_id], db_path=db_path)
    if df.empty:
        return {}
    return df.iloc[0].to_dict()


def expire_cards(db_path: Optional[Path] = None, max_age_days: int = 90) -> int:
    """Retires Edge Cards whose last_validated date exceeds max_age_days (§14.4 & A6.7).

    Args:
        db_path (Optional[Path]): DuckDB database path override.
        max_age_days (int): Maximum allowed card age in days. Defaults to 90.

    Returns:
        int: Count of cards retired.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    cutoff_date = (pd.Timestamp.now(tz="UTC") - pd.Timedelta(days=max_age_days)).strftime("%Y-%m-%d %H:%M:%S")

    con = duckdb.connect(str(target_db))
    count_before = con.execute("SELECT COUNT(*) FROM edge_cards WHERE status = 'retired'").fetchone()[0]

    con.execute("""
        UPDATE edge_cards
        SET status = 'retired'
        WHERE last_validated < CAST(? AS TIMESTAMP) AND status != 'retired'
    """, [cutoff_date])

    count_after = con.execute("SELECT COUNT(*) FROM edge_cards WHERE status = 'retired'").fetchone()[0]
    con.close()

    retired_count = count_after - count_before
    logger.info("Expired %d stale Edge Cards older than %d days", retired_count, max_age_days)
    return retired_count
