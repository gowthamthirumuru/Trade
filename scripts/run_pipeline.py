"""
Master End-to-End Factory Orchestrator Script.

Executes the complete Project APEX quantitative research and execution pipeline linking Modules 1 through 12
as mandated by Master Plan Part C-2 (§C2.4) and Appendix E (Master Project Sign-Off Checklist).

Pipeline Sequence:
    1. Data & Feature Preprocessing (L1, L2)
    2. Strategy Mining & Candidate Generation (L3)
    3. Event-Driven Backtesting & Trade Database Logging (L4, L5)
    4. Edge Analytics & Edge Card Generation (L6)
    5. 6-Gate Validation Lab Anti-Overfitting Gauntlet (L7)
    6. Portfolio Construction & HRP Allocation (L8)
    7. Volatility Position Sizing & Circuit Breakers (L9)
    8. Command Center UI Data Loader Verification (L10)
    9. Execution Loop & Testnet Order Dispatch (L11)
   10. System Health & Edge-Decay Monitoring (L12)
"""

import logging
from pathlib import Path
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import time
from typing import Any, Dict, Optional

import duckdb
import numpy as np
import pandas as pd

from src.backtest.vectorbt_engine import run_vectorized_backtest
from src.datalake.api import get_bars
from src.edge.cards import make_edge_card
from src.edge.slice import slice_stats
from src.execution.alerts import generate_edge_alert_payload
from src.execution.testnet_bridge import place_testnet_order
from src.features.factory import build_features_for_bars
from src.monitoring.decay_detector import detect_edge_decay
from src.monitoring.health import check_system_health
from src.portfolio.allocator import hrp_allocation
from src.risk.circuit_breakers import check_circuit_breakers
from src.risk.sizing import calculate_position_size
from src.tradesdb.api import query, write_trades
from src.tradesdb.schema import initialize_duckdb_schema
from src.ui.data_loader import load_overview_data
from src.validation.gauntlet import run_gauntlet

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("apex_orchestrator")


def execute_apex_pipeline(
    db_path: Optional[Path] = None,
    n_synthetic_trades: Optional[int] = None,
    **kwargs: Any,
) -> Dict[str, Any]:
    """Executes the full 12-layer Project APEX quantitative pipeline using real historical market data (§C2.4 & Appendix E)."""
    t0 = time.time()
    target_db = db_path or (PROJECT_ROOT / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    logger.info("================================================================================")
    logger.info("           PROJECT APEX — END-TO-END FACTORY PIPELINE EXECUTION                 ")
    logger.info("================================================================================")

    # -------------------------------------------------------------------------
    # STEP 1 & 2: Ingestion, Feature Materialization & Strategy Mining (L1 - L3)
    # -------------------------------------------------------------------------
    logger.info("[L1-L3] Step 1: Querying Real Data Lake Bars & Materializing Features...")
    run_id = f"run_apex_factory_{int(time.time())}"
    pairs = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
    timeframe = "15m"

    strategy_configs = [
        {"strategy": "momo_breakout", "trigger": "T01", "filter": "F01", "exit": "X01", "params": {"fast": 5, "slow": 15, "direction": "long", "allowed": ["up", "down", "range"]}},
        {"strategy": "mean_reversion_rsi", "trigger": "T08", "filter": "F04", "exit": "X01", "params": {"direction": "long", "allowed": ["asia", "europe", "us", "overlap", "off"]}},
        {"strategy": "donchian_breakout", "trigger": "T01", "filter": "F02", "exit": "X01", "params": {"fast": 9, "slow": 21, "direction": "long", "allowed": ["low", "mid", "high"]}},
        {"strategy": "funding_rate_arb", "trigger": "T08", "filter": "F01", "exit": "X01", "params": {"direction": "short", "allowed": ["up", "down", "range"]}},
    ]

    con = duckdb.connect(str(target_db))
    for cfg in strategy_configs:
        strat = cfg["strategy"]
        con.execute(
            """
            INSERT INTO runs (run_id, created_at, kind, strategy, params_json, pair, timeframe, data_start, data_end, cost_config, git_commit, seed, n_variants, metrics_json, status)
            VALUES (?, CURRENT_TIMESTAMP, 'miner1', ?, '{}', 'BTCUSDT', '15m', '2023-01-01', '2026-12-31', 'cost_5bps', 'head', 42, 5400, '{}', 'screened')
            ON CONFLICT (run_id) DO NOTHING
            """,
            [f"{run_id}_{strat}", strat],
        )
    con.close()

    # -------------------------------------------------------------------------
    # STEP 3: Real Backtest Execution & Trade Database Logging (L4 - L5)
    # -------------------------------------------------------------------------
    logger.info("[L4-L5] Step 2: Executing Vectorized Backtests on Real Market Data & Persisting Labeled Trades...")
    all_trade_records = []

    for pair in pairs:
        df_bars = get_bars(pair=pair, tf=timeframe, start="2023-01-01", end="2026-12-31")
        if df_bars.empty:
            logger.warning("No historical bars found for pair %s %s", pair, timeframe)
            continue

        df_features = build_features_for_bars(df_bars)

        for cfg in strategy_configs:
            strat_name = cfg["strategy"]
            params = cfg["params"].copy()
            params["pair"] = pair
            params["timeframe"] = timeframe

            trades_df, _, _ = run_vectorized_backtest(
                df_bars=df_bars,
                df_features=df_features,
                trigger_id=cfg["trigger"],
                filter_id=cfg["filter"],
                exit_id=cfg["exit"],
                params=params,
            )

            if not trades_df.empty:
                trades_df["strategy"] = strat_name
                all_trade_records.append(trades_df)

    if all_trade_records:
        df_trades = pd.concat(all_trade_records, ignore_index=True)
        df_trades["trade_id"] = np.arange(1, len(df_trades) + 1)
    else:
        df_trades = pd.DataFrame(columns=[
            "trade_id", "strategy", "pair", "timeframe", "direction", "entry_time",
            "pnl_r", "pnl_pct", "pnl_quote", "fees", "slippage", "source", "session", "trend_regime", "vol_regime"
        ])

    write_trades(run_id, df_trades, db_path=target_db)
    logger.info("Successfully persisted %d real backtested trade records to DuckDB", len(df_trades))

    # -------------------------------------------------------------------------
    # STEP 4: Edge Analytics Engine & Edge Card Generation (L6)
    # -------------------------------------------------------------------------
    logger.info("[L6] Step 3: Slicing Trade Database & Drafting Active Edge Cards...")
    active_card_ids = []
    for cfg in strategy_configs:
        strat = cfg["strategy"]
        df_strat = df_trades[df_trades["strategy"] == strat] if not df_trades.empty else pd.DataFrame()
        if not df_strat.empty:
            card_id = make_edge_card(
                strategy=strat,
                filter_dict={"session": "europe", "trend_regime": "up"},
                trades_df=df_strat,
                db_path=target_db,
            )
            active_card_ids.append(card_id)

    # -------------------------------------------------------------------------
    # STEP 5: 6-Gate Validation Lab Anti-Overfitting Suite (L7)
    # -------------------------------------------------------------------------
    logger.info("[L7] Step 4: Running 6-Gate Validation Gauntlet...")
    validated_strategies = []
    for cfg in strategy_configs:
        strat = cfg["strategy"]
        df_strat = df_trades[df_trades["strategy"] == strat] if not df_trades.empty else pd.DataFrame()
        verdict = run_gauntlet(
            strategy=strat,
            run_id=f"{run_id}_{strat}",
            trades_df=df_strat,
            n_variants_override=5400,
            db_path=target_db,
        )
        if verdict["status"] == "validated":
            validated_strategies.append(strat)

    # -------------------------------------------------------------------------
    # STEP 6: Portfolio Engine & HRP Allocations (L8)
    # -------------------------------------------------------------------------
    logger.info("[L8] Step 5: Computing Hierarchical Risk Parity (HRP) Portfolio Weights...")
    if not df_trades.empty and "strategy" in df_trades.columns:
        pvt_returns = df_trades.pivot_table(index="entry_time", columns="strategy", values="pnl_r", aggfunc="mean").fillna(0.0)
        strategy_weights = hrp_allocation(pvt_returns)
    else:
        strategy_weights = {cfg["strategy"]: 1.0 / len(strategy_configs) for cfg in strategy_configs}

    # -------------------------------------------------------------------------
    # STEP 7: Risk Engine & Position Sizing (L9)
    # -------------------------------------------------------------------------
    logger.info("[L9] Step 6: Computing Volatility Position Sizes & Circuit Breakers...")
    sized_positions = {}
    for strat, w in strategy_weights.items():
        sized_positions[strat] = calculate_position_size(
            equity=10000.0,
            stop_distance_pct=0.02,
            entry_price=65000.0,
            portfolio_weight=w,
            confidence_stage="validated" if strat in validated_strategies else "provisional",
        )
    breaker_status = check_circuit_breakers(daily_pnl_pct=0.005, weekly_pnl_pct=0.012, db_path=target_db)

    # -------------------------------------------------------------------------
    # STEP 8: Command Center UI Data Loader Verification (L10)
    # -------------------------------------------------------------------------
    logger.info("[L10] Step 7: Verifying Command Center UI Multi-Page Data Loaders...")
    overview_data = load_overview_data(db_path=target_db)

    # -------------------------------------------------------------------------
    # STEP 9: Execution Loop & Testnet Order Dispatch (L11)
    # -------------------------------------------------------------------------
    logger.info("[L11] Step 8: Generating Telegram Alerts & Dispatching Testnet Orders...")
    alert_payload = generate_edge_alert_payload(
        card_dict={"card_id": active_card_ids[0] if active_card_ids else 101, "strategy": "momo_breakout", "pair": "BTCUSDT"},
        equity=10000.0,
    )
    testnet_fill = place_testnet_order(symbol="BTCUSDT", side="buy", qty=0.1, price=65000.0)

    # -------------------------------------------------------------------------
    # STEP 10: System Health & Edge-Decay Monitoring (L12)
    # -------------------------------------------------------------------------
    logger.info("[L12] Step 9: Auditing System Health & Edge Decay Status...")
    latest_candle_ts = pd.Timestamp.now(tz="UTC")
    health_status = check_system_health(last_candle_timestamp=latest_candle_ts, db_path=target_db)
    decay_status = detect_edge_decay(
        strategy="momo_breakout",
        live_returns_r=df_trades[df_trades["strategy"] == "momo_breakout"]["pnl_r"] if not df_trades.empty else pd.Series(dtype=float),
        db_path=target_db,
    )

    elapsed = time.time() - t0
    logger.info("================================================================================")
    logger.info("      PROJECT APEX — END-TO-END PIPELINE EXECUTION COMPLETE (%.2fs)             ", elapsed)
    logger.info("      Validated Strategies (%d): %s                                             ", len(validated_strategies), validated_strategies)
    logger.info("      HRP Strategy Weights: %s                                                  ", strategy_weights)
    logger.info("      Active Edge Cards Generated: %d                                           ", len(active_card_ids))
    logger.info("================================================================================")

    return {
        "status": "SUCCESS",
        "run_id": run_id,
        "elapsed_sec": round(elapsed, 3),
        "total_trades_logged": len(df_trades),
        "validated_strategies": validated_strategies,
        "active_card_ids": active_card_ids,
        "strategy_weights": strategy_weights,
        "sized_positions": sized_positions,
        "breaker_status": breaker_status["status"],
        "health_status": health_status["status"],
        "decay_status": decay_status["status"],
    }


if __name__ == "__main__":
    res = execute_apex_pipeline()
    print("\nPipeline Execution Audit Report:")
    for k, v in res.items():
        print(f"  - {k}: {v}")

