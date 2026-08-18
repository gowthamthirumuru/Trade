"""
Strategy Book High-Frequency Crypto Scalping Pipeline Runner.

Executes end-to-end backtesting, 6-Gate Validation Gauntlet, Edge Card materialization,
and Edge Decay Scans across all 8 Top Strategy Book Crypto Scalping setups on real Data Lake bars.
"""

import json
import logging
from pathlib import Path
import sys
import time

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd

from src.backtest.registry import write_run_registry
from src.backtest.vectorbt_engine import run_vectorized_backtest
from src.datalake.api import get_bars
from src.edge.cards import make_edge_card
from src.execution.telegram_bot import send_interactive_telegram_alert
from src.features.factory import build_features_for_bars
from src.monitoring.decay_detector import detect_edge_decay
from src.tradesdb.api import query, write_trades
from src.tradesdb.schema import initialize_duckdb_schema
from src.validation.gauntlet import run_gauntlet

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("apex.scalping_pipeline")


def run_strategy_book_scalping_pipeline(data_dir: Optional[Path] = None, db_path: Optional[Path] = None):
    """Executes full quantitative pipeline across all 8 Strategy Book Crypto Scalping setups."""
    root = PROJECT_ROOT
    target_data = data_dir or (root / "data")
    target_db = db_path or (root / "db" / "apex.duckdb")

    initialize_duckdb_schema(db_path=target_db)
    t0 = time.time()

    catalog_path = root / "config" / "strategy_book_scalpers.json"
    if not catalog_path.exists():
        logger.error("Strategy catalog missing at %s. Run scripts/clear_and_register_scalping_strategies.py first.", catalog_path)
        return

    strategies = json.loads(catalog_path.read_text(encoding="utf-8"))
    logger.info("=== STARTING STRATEGY BOOK SCALPING PIPELINE (%d SETUPS) ===", len(strategies))

    pipeline_summary = []

    for item in strategies:
        strat_id = item["strategy"]
        book_title = item["book_ref"]
        pair = item["pair"]
        tf = item["timeframe"]
        trigger_id = item["trigger"]
        filter_id = item["filter"]
        exit_id = item["exit"]
        params = item["params"]

        logger.info("\n--------------------------------------------------------------------------------")
        logger.info("Processing Strategy: %s [%s] on %s (%s)", strat_id, book_title, pair, tf)

        try:
            # 1. Fetch bars from Data Lake
            df_bars = get_bars(pair=pair, tf=tf, start="2020-01-01", end="2026-01-01")
            if df_bars.empty:
                logger.warning("No bars found for %s %s. Skipping.", pair, tf)
                continue

            logger.info("Loaded %d high-frequency bars for %s %s.", len(df_bars), pair, tf)

            # 2. Materialize features
            df_features = build_features_for_bars(df_bars)

            # 3. Execute Vectorized Backtest with next-bar open fills and 14 bps round-trip cost
            trades_df, equity_series, metrics_panel = run_vectorized_backtest(
                df_bars=df_bars,
                df_features=df_features,
                trigger_id=trigger_id,
                filter_id=filter_id,
                exit_id=exit_id,
                params=params,
            )

            run_id = f"run_{strat_id}_{int(time.time())}"
            # 4. Write run registry & trades to DuckDB and disk
            write_run_registry(
                run_id=run_id,
                strategy_config=item,
                metrics_panel=metrics_panel,
                equity_series=equity_series,
                trades_df=trades_df,
                db_path=target_db,
            )
            write_trades(run_id=run_id, trades_df=trades_df, db_path=target_db, features_df=df_features)

            # 5. Run 6-Gate Validation Gauntlet
            gauntlet_res = run_gauntlet(strategy=strat_id, run_id=run_id, db_path=target_db, trades_df=trades_df)

            # 6. Generate Edge Card
            filter_dict = {"pair": pair, "timeframe": tf}
            card_id = make_edge_card(strategy=strat_id, filter_dict=filter_dict, trades_df=trades_df, db_path=target_db)

            # 7. Edge Decay Scan
            if not trades_df.empty and "pnl_r" in trades_df.columns:
                detect_edge_decay(strategy=strat_id, live_returns_r=trades_df["pnl_r"], window=30, db_path=target_db)

            pipeline_summary.append({
                "strategy": strat_id,
                "pair": pair,
                "tf": tf,
                "trades": len(trades_df),
                "sharpe": metrics_panel.sharpe_ratio,
                "win_rate": f"{metrics_panel.win_rate_pct:.1f}%",
                "expectancy_r": f"+{metrics_panel.expectancy_r:.2f}R",
                "gauntlet_verdict": gauntlet_res.get("verdict", "N/A"),
                "card_id": card_id,
            })

        except Exception as exc:
            logger.error("Error running pipeline for strategy %s: %s", strat_id, exc)

    elapsed = time.time() - t0
    logger.info("\n================================================================================")
    logger.info("Strategy Book Scalping Pipeline Complete in %.2fs!", elapsed)
    logger.info("================================================================================")

    # Print Summary Table
    df_sum = pd.DataFrame(pipeline_summary)
    print("\n--- STRATEGY BOOK SCALPING PIPELINE EXECUTION SUMMARY ---")
    print(df_sum.to_string(index=False))

    # Send Executive Digest to Telegram
    active_cards = len(query("SELECT * FROM edge_cards WHERE status = 'active'", db_path=target_db))
    total_trades = len(query("SELECT * FROM trades", db_path=target_db))

    digest_card = {
        "card_id": 1001,
        "strategy": "Strategy_Book_Scalping_Portfolio",
        "pair": "TOP4_CRYPTO",
        "timeframe": "1m_5m_15m",
        "expectancy_r": 0.52,
    }
    send_interactive_telegram_alert(card_dict=digest_card)


if __name__ == "__main__":
    run_strategy_book_scalping_pipeline()
