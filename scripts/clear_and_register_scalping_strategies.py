"""
Clear Existing Strategies & Register Strategy Book Top Scalping Strategies.

Wipes old demo backtest trades from DuckDB (`trades`, `runs`, `edge_cards`, `decay_events`)
and registers the 8 top Crypto Scalping Strategies directly from the Strategy Book (§S38, §S40, §S48, §S50, §S52, §S59, §S60, §S93)
ready for execution upon user confirmation.
"""

import json
import logging
from pathlib import Path
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import duckdb
import pandas as pd
from src.tradesdb.schema import initialize_duckdb_schema

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("apex.strategy_reset")

STRATEGY_BOOK_SCALPING_STRATEGIES = [
    {
        "strategy": "S38_ema_rsi_scalp",
        "book_ref": "S38 · 5-Minute EMA Scalping (8/21 + RSI)",
        "pair": "BTCUSDT",
        "timeframe": "5m",
        "trigger": "T01",
        "filter": "F01",
        "exit": "X01",
        "params": {"fast": 8, "slow": 21, "rsi_thresh": 50, "direction": "long", "k_sl": 1.0, "m_tp": 2.0},
    },
    {
        "strategy": "S40_bollinger_1m_scalp",
        "book_ref": "S40 · Bollinger Band 1-Minute Scalp",
        "pair": "BTCUSDT",
        "timeframe": "1m",
        "trigger": "T04",
        "filter": "F02",
        "exit": "X01",
        "params": {"n": 20, "k": 2.0, "direction": "long", "k_sl": 1.0, "m_tp": 1.5},
    },
    {
        "strategy": "S48_chandelier_scalp",
        "book_ref": "S48 · Chandelier-Trail Crypto Scalp",
        "pair": "SOLUSDT",
        "timeframe": "5m",
        "trigger": "T08",
        "filter": "F05",
        "exit": "X02",
        "params": {"atr_period": 14, "mult": 3.0, "direction": "long", "k_sl": 1.2, "m_tp": 2.5},
    },
    {
        "strategy": "S50_btc_21_23_window",
        "book_ref": "S50 · The 21:00–23:00 UTC Bitcoin Window",
        "pair": "BTCUSDT",
        "timeframe": "5m",
        "trigger": "T09",
        "filter": "F08",
        "exit": "X01",
        "params": {"session": "asia", "direction": "long", "k_sl": 1.0, "m_tp": 2.0},
    },
    {
        "strategy": "S52_monday_asia_open",
        "book_ref": "S52 · The Monday Asia Open Effect (BTC Trend Window)",
        "pair": "BTCUSDT",
        "timeframe": "15m",
        "trigger": "T09",
        "filter": "F09",
        "exit": "X01",
        "params": {"day_of_week": 0, "direction": "long", "k_sl": 1.0, "m_tp": 2.0},
    },
    {
        "strategy": "S59_eth_5m_scalp",
        "book_ref": "S59 · ETH 5-Minute Optimized Scalping System",
        "pair": "ETHUSDT",
        "timeframe": "5m",
        "trigger": "T01",
        "filter": "F03",
        "exit": "X01",
        "params": {"fast": 13, "slow": 34, "direction": "long", "k_sl": 1.0, "m_tp": 2.0},
    },
    {
        "strategy": "S60_bollinger_squeeze",
        "book_ref": "S60 · Crypto Bollinger Squeeze Breakout",
        "pair": "BNBUSDT",
        "timeframe": "15m",
        "trigger": "T17",
        "filter": "F04",
        "exit": "X02",
        "params": {"n": 20, "bb_width_max": 0.02, "direction": "long", "k_sl": 1.0, "m_tp": 2.5},
    },
    {
        "strategy": "S93_liquidation_cascade",
        "book_ref": "S93 · Liquidation-Cascade Reversal (Crypto Perps)",
        "pair": "SOLUSDT",
        "timeframe": "1m",
        "trigger": "T07",
        "filter": "F07",
        "exit": "X01",
        "params": {"z": 2.5, "direction": "long", "k_sl": 1.0, "m_tp": 2.0},
    },
]


def clear_db_and_register_strategies(db_path: Optional[Path] = None):
    """Clears old trades from DuckDB and registers Strategy Book Crypto Scalping setups."""
    root = PROJECT_ROOT
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    logger.info("Clearing existing strategy records from DuckDB database at %s...", target_db)
    con = duckdb.connect(str(target_db))

    con.execute("TRUNCATE TABLE trades;")
    con.execute("TRUNCATE TABLE runs;")
    con.execute("TRUNCATE TABLE edge_cards;")
    con.execute("TRUNCATE TABLE decay_events;")
    logger.info("Successfully truncated trades, runs, edge_cards, and decay_events tables.")

    # Save Strategy Book Scalping Catalog to JSON configuration artifact
    catalog_path = root / "config" / "strategy_book_scalpers.json"
    catalog_path.parent.mkdir(parents=True, exist_ok=True)
    catalog_path.write_text(json.dumps(STRATEGY_BOOK_SCALPING_STRATEGIES, indent=2), encoding="utf-8")
    logger.info("Saved %d Strategy Book Scalping Setups to %s", len(STRATEGY_BOOK_SCALPING_STRATEGIES), catalog_path)

    con.close()
    logger.info("Clear & Reset Complete! Ready for 'GO' execution signal.")


if __name__ == "__main__":
    clear_db_and_register_strategies()
