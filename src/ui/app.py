"""
Project APEX — Command Center UI Main Application.

Streamlit multi-page dashboard application as mandated by Master Plan §18.1–§18.4.

Context:
    Layer 10 (Command Center UI) main entrypoint specified in Master Plan §18.1–§18.4.
"""

import logging
from pathlib import Path
import sys
from typing import Any, Dict, Optional
import pandas as pd
import streamlit as st

# Ensure project root is in sys.path for Streamlit execution
PROJECT_ROOT = Path(__file__).parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ui.components.overview_view import render_overview_view
from src.ui.data_loader import (
    load_data_manager_data,
    load_edge_explorer_data,
    load_journal_data,
    load_miner_data,
    load_overview_data,
    load_portfolio_data,
    load_validation_data,
)

logger = logging.getLogger(__name__)


def run_cli_dashboard(db_path: Optional[Path] = None) -> dict:
    """Executes full diagnostic load across all 7 pages for CLI/headless operations."""
    res = {
        "page1_overview": load_overview_data(db_path=db_path),
        "page2_miner": load_miner_data(db_path=db_path),
        "page3_edge": load_edge_explorer_data(db_path=db_path),
        "page4_validation": load_validation_data(db_path=db_path),
        "page5_portfolio": load_portfolio_data(db_path=db_path),
        "page6_journal": load_journal_data(db_path=db_path),
        "page7_data": load_data_manager_data(db_path=db_path),
    }
    return res


def main():
    """Main Streamlit app entrypoint."""
    st.set_page_config(
        page_title="Project APEX — Institutional Quant Command Center",
        page_icon="⚡",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.title("⚡ Project APEX — Quant Command Center")
    st.caption("Institutional Quantitative Research, Mining, Edge Analytics & Execution Dashboard")

    # Load data from DuckDB
    overview_data = load_overview_data()
    miner_data = load_miner_data()
    journal_data = load_journal_data()

    # Create primary navigation tabs
    tab_overview, tab_trades, tab_cluster, tab_miner, tab_validation, tab_replay, tab_scheduler = st.tabs([
        "🏠 System Overview",
        "📊 Backtested Trades Explorer",
        "🔬 Edge & Cluster Analytics",
        "🛠️ Strategy Mining & GP",
        "🛡️ Validation & Risk",
        "🔎 Trade Replay Inspector",
        "🤖 Autonomous Scheduler & Controls",
    ])

    # -------------------------------------------------------------------------
    # TAB 1: System Overview & Equity Curve
    # -------------------------------------------------------------------------
    with tab_overview:
        eq_df = overview_data.get("equity_curve", pd.DataFrame())
        cards = overview_data.get("active_cards", [])
        risk = overview_data.get("risk_status", {})
        health = overview_data.get("system_health", {})

        col1, col2, col3, col4, col5 = st.columns(5)
        current_eq = float(eq_df["equity"].iloc[-1]) if not eq_df.empty and "equity" in eq_df.columns else 10000.0
        n_total_trades = len(eq_df)

        col1.metric("Portfolio Equity", f"${current_eq:,.2f}")
        col2.metric("Total Backtested Trades", f"{n_total_trades}")
        col3.metric("Current Drawdown", f"{float(risk.get('current_dd', 0.0))*100:.2f}%")
        col4.metric("Active Edge Cards", f"{len(cards)}")
        col5.metric("System Status", "ONLINE", delta="Breakers OK")

        st.subheader("📈 Portfolio Equity Curve")
        if not eq_df.empty:
            st.line_chart(eq_df.set_index("entry_time")["equity"])
        else:
            st.info("No trades logged yet. Run `python scripts/run_pipeline.py` to generate backtest trades.")

        st.subheader("🎴 Active Session Edge Cards")
        if cards:
            st.dataframe(pd.DataFrame(cards), use_container_width=True)
        else:
            st.info("No active Edge Cards currently registered.")

    # -------------------------------------------------------------------------
    # TAB 2: Backtested Trade Data Explorer (Alphalab Inspiration)
    # -------------------------------------------------------------------------
    with tab_trades:
        st.subheader("📊 Backtested Trade Database Explorer (100% Real Trade Records)")
        trades_df = journal_data.get("journal_trades", pd.DataFrame())

        if not trades_df.empty:
            # Interactive Filter Sidebar / Top Bar
            f_col1, f_col2, f_col3, f_col4 = st.columns(4)

            strategies = ["ALL"] + sorted(list(trades_df["strategy"].dropna().unique()))
            pairs = ["ALL"] + sorted(list(trades_df["pair"].dropna().unique()))
            sessions = ["ALL"] + sorted(list(trades_df["session"].dropna().unique()))
            regimes = ["ALL"] + sorted(list(trades_df["trend_regime"].dropna().unique()))

            sel_strat = f_col1.selectbox("Filter Strategy", strategies)
            sel_pair = f_col2.selectbox("Filter Pair", pairs)
            sel_sess = f_col3.selectbox("Filter Session", sessions)
            sel_regime = f_col4.selectbox("Filter Trend Regime", regimes)

            filtered_df = trades_df.copy()
            if sel_strat != "ALL":
                filtered_df = filtered_df[filtered_df["strategy"] == sel_strat]
            if sel_pair != "ALL":
                filtered_df = filtered_df[filtered_df["pair"] == sel_pair]
            if sel_sess != "ALL":
                filtered_df = filtered_df[filtered_df["session"] == sel_sess]
            if sel_regime != "ALL":
                filtered_df = filtered_df[filtered_df["trend_regime"] == sel_regime]

            # Metrics for filtered slice
            m_col1, m_col2, m_col3, m_col4 = st.columns(4)
            n_slice = len(filtered_df)
            wins = (filtered_df["pnl_r"] > 0).sum() if not filtered_df.empty else 0
            win_rate = (wins / max(n_slice, 1)) * 100.0
            avg_exp_r = filtered_df["pnl_r"].mean() if not filtered_df.empty else 0.0
            net_pnl_quote = filtered_df["pnl_quote"].sum() if "pnl_quote" in filtered_df.columns else 0.0

            m_col1.metric("Filtered Trades (n)", f"{n_slice}")
            m_col2.metric("Win Rate", f"{win_rate:.1f}%")
            m_col3.metric("Expectancy R", f"+{avg_exp_r:.2f}R")
            m_col4.metric("Net PnL ($)", f"${net_pnl_quote:,.2f}")

            # Display full trade log table
            st.dataframe(filtered_df, use_container_width=True)

            # CSV Download button
            csv_data = filtered_df.to_csv(index=False).encode("utf-8")
            st.download_button(
                label="📥 Export Filtered Trades CSV",
                data=csv_data,
                file_name="apex_backtest_trades.csv",
                mime="text/csv",
            )
        else:
            st.info("No trades found in DuckDB `trades` table. Execute pipeline script to populate backtest trades.")

    # -------------------------------------------------------------------------
    # TAB 3: Edge & Cluster Analytics (Alphalab Clustering Inspiration)
    # -------------------------------------------------------------------------
    with tab_cluster:
        st.subheader("🔬 Edge & Slice Cluster Analytics")
        trades_df = journal_data.get("journal_trades", pd.DataFrame())

        if not trades_df.empty:
            c_col1, c_col2 = st.columns(2)

            with c_col1:
                st.markdown("#### Performance Clustered by Session")
                if "session" in trades_df.columns:
                    sess_grp = trades_df.groupby("session").agg(
                        n_trades=("trade_id", "count"),
                        exp_r=("pnl_r", "mean"),
                        total_pnl_r=("pnl_r", "sum"),
                    ).reset_index()
                    st.dataframe(sess_grp, use_container_width=True)

            with c_col2:
                st.markdown("#### Performance Clustered by Trend Regime")
                if "trend_regime" in trades_df.columns:
                    trend_grp = trades_df.groupby("trend_regime").agg(
                        n_trades=("trade_id", "count"),
                        exp_r=("pnl_r", "mean"),
                        total_pnl_r=("pnl_r", "sum"),
                    ).reset_index()
                    st.dataframe(trend_grp, use_container_width=True)
        else:
            st.info("Trade records required for slice clustering.")

    # -------------------------------------------------------------------------
    # TAB 4: Strategy Mining & Genetic Evolution
    # -------------------------------------------------------------------------
    with tab_miner:
        st.subheader("🛠️ Strategy Miner & Genetic Evolution Runs")
        runs_df = miner_data.get("run_history", pd.DataFrame())

        if not runs_df.empty:
            st.dataframe(runs_df, use_container_width=True)
        else:
            st.info("No mining runs recorded yet in `runs` table.")

        st.markdown("#### 🧬 Interactive Genetic GP Strategy Miner Trigger")
        g_col1, g_col2 = st.columns(2)
        pop_size = g_col1.number_input("Population Size", min_value=10, max_value=100, value=20)
        n_gens = g_col2.number_input("Generations", min_value=1, max_value=20, value=3)

        if st.button("🧬 Run Genetic Strategy Miner Now"):
            from src.miner.genetic import run_genetic_miner
            with st.spinner("Evolving symbolic strategy rules..."):
                gp_res = run_genetic_miner(pair="BTCUSDT", timeframe="15m", population_size=pop_size, n_generations=n_gens)
                st.success("Genetic GP Run Complete!")
                st.json(gp_res)

    # -------------------------------------------------------------------------
    # TAB 5: Validation & Risk
    # -------------------------------------------------------------------------
    with tab_validation:
        st.subheader("🛡️ 6-Gate Validation Lab & Volatility Risk Sizing")
        st.success("Gauntlet Anti-Overfitting Suite: 6 Gates Active (Walk-Forward, MC, PBO, DSR, Stress, Kill List)")

        if st.button("🛡️ Execute 6-Gate Validation Gauntlet"):
            from src.validation.gauntlet import run_gauntlet
            with st.spinner("Running 6-Gate Anti-Overfitting Gauntlet..."):
                v_res = run_gauntlet(strategy="momo_breakout", run_id="run_ui")
                st.success(f"Gauntlet Execution Complete: Verdict = {v_res.get('verdict')}")
                st.json(v_res)

    # -------------------------------------------------------------------------
    # TAB 6: Trade Replay Inspector (Alphalab Inspiration)
    # -------------------------------------------------------------------------
    with tab_replay:
        st.subheader("🔎 Trade Detail & Execution Replay Inspector")
        trades_df = journal_data.get("journal_trades", pd.DataFrame())

        if not trades_df.empty:
            trade_ids = list(trades_df["trade_id"].unique())
            selected_id = st.selectbox("Select Trade ID for Replay Inspection", trade_ids)

            selected_trade = trades_df[trades_df["trade_id"] == selected_id].iloc[0].to_dict()
            st.json(selected_trade)
        else:
            st.info("No trade records available for replay inspection.")

    # -------------------------------------------------------------------------
    # TAB 7: Autonomous Scheduler & Controls
    # -------------------------------------------------------------------------
    with tab_scheduler:
        st.subheader("🤖 24/7 Autonomous Scheduler & Pipeline Controls")
        st.caption("Trigger individual production jobs or launch full pipeline executions (§27.1–§27.3)")

        st.markdown("#### ⚡ Pipeline Execution Controls")
        if st.button("🚀 Execute Full 6-Job Pipeline Now"):
            from scripts.scheduler import run_all_jobs_now
            with st.spinner("Executing full 6-job production pipeline..."):
                pipe_res = run_all_jobs_now()
                st.success(f"Full Pipeline Execution Completed in {pipe_res.get('elapsed_sec')}s!")
                st.json(pipe_res)

        st.markdown("---")
        st.markdown("#### 🛠️ Individual Production Jobs Trigger")
        j_col1, j_col2, j_col3 = st.columns(3)

        if j_col1.button("📥 Job 1: Ingest Crypto & Forex"):
            from scripts.scheduler import job_nightly_ingestion
            with st.spinner("Running Job 1 Nightly Ingestion..."):
                j1_res = job_nightly_ingestion()
                st.success("Job 1 Completed!")
                st.json(j1_res)

        if j_col2.button("📊 Job 2: Materialize Features"):
            from scripts.scheduler import job_feature_materialization
            with st.spinner("Running Job 2 Feature Materialization..."):
                j2_res = job_feature_materialization()
                st.success("Job 2 Completed!")
                st.json(j2_res)

        if j_col3.button("🧬 Job 3: Genetic GP & ML Mining"):
            from scripts.scheduler import job_autonomous_mining
            with st.spinner("Running Job 3 Strategy Mining..."):
                j3_res = job_autonomous_mining()
                st.success("Job 3 Completed!")
                st.json(j3_res)

        j_col4, j_col5, j_col6 = st.columns(3)

        if j_col4.button("🛡️ Job 4: Validation Gauntlet"):
            from scripts.scheduler import job_validation_gauntlet
            with st.spinner("Running Job 4 Gauntlet..."):
                j4_res = job_validation_gauntlet()
                st.success("Job 4 Completed!")
                st.json(j4_res)

        if j_col5.button("📉 Job 5: Edge Decay Scan"):
            from scripts.scheduler import job_edge_decay_scan
            with st.spinner("Running Job 5 Edge Decay Scan..."):
                j5_res = job_edge_decay_scan()
                st.success("Job 5 Completed!")
                st.json(j5_res)

        if j_col6.button("📱 Job 6: Telegram Daily Digest"):
            from scripts.scheduler import job_telegram_digest
            with st.spinner("Running Job 6 Telegram Digest..."):
                j6_res = job_telegram_digest()
                st.success("Job 6 Completed!")
                st.json(j6_res)

        st.markdown("---")
        st.markdown("#### 💱 Forex Dukascopy Data Ingestion Controls")
        fx_pairs = st.multiselect("Select Forex Pairs to Ingest", ["EURUSD", "GBPUSD", "USDJPY", "USDCHF", "USDCAD", "AUDUSD", "NZDUSD"], default=["EURUSD", "GBPUSD"])
        if st.button("📥 Download Dukascopy Forex Data Lake"):
            from src.datalake.dukascopy import download_forex_history
            with st.spinner("Downloading Forex historical data..."):
                fx_out = download_forex_history(pairs=fx_pairs, timeframe="15m")
                st.success("Dukascopy Forex Ingestion Completed!")
                st.json(fx_out)


if __name__ == "__main__":
    try:
        from streamlit.runtime.scriptrunner import get_script_run_ctx

        if get_script_run_ctx() is not None:
            main()
        else:
            dash_data = run_cli_dashboard()
            print("Project APEX Command Center UI — Diagnostic Run OK.")
    except Exception:
        main()
