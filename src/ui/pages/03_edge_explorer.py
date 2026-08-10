"""
Page 3 — Edge Explorer Page.
"""

from pathlib import Path
import sys
import streamlit as st

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from src.ui.data_loader import load_edge_explorer_data

st.set_page_config(page_title="APEX — Edge Explorer", page_icon="🔬", layout="wide")

st.title("🔬 Edge Explorer & Slicing Engine")
st.caption("Slice Trade Database across Session, Pair, Timeframe & Regime Dimensions")

data = load_edge_explorer_data()
trades_df = data.get("filtered_trades", pd.DataFrame())

if not trades_df.empty:
    f_col1, f_col2, f_col3, f_col4 = st.columns(4)

    strategies = ["ALL"] + sorted(list(trades_df["strategy"].dropna().unique()))
    pairs = ["ALL"] + sorted(list(trades_df["pair"].dropna().unique()))
    sessions = ["ALL"] + sorted(list(trades_df["session"].dropna().unique()))
    regimes = ["ALL"] + sorted(list(trades_df["trend_regime"].dropna().unique()))

    sel_strat = f_col1.selectbox("Filter Strategy", strategies, key="edge_strat")
    sel_pair = f_col2.selectbox("Filter Pair", pairs, key="edge_pair")
    sel_sess = f_col3.selectbox("Filter Session", sessions, key="edge_sess")
    sel_regime = f_col4.selectbox("Filter Trend Regime", regimes, key="edge_regime")

    filtered_df = trades_df.copy()
    if sel_strat != "ALL":
        filtered_df = filtered_df[filtered_df["strategy"] == sel_strat]
    if sel_pair != "ALL":
        filtered_df = filtered_df[filtered_df["pair"] == sel_pair]
    if sel_sess != "ALL":
        filtered_df = filtered_df[filtered_df["session"] == sel_sess]
    if sel_regime != "ALL":
        filtered_df = filtered_df[filtered_df["trend_regime"] == sel_regime]

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

    st.dataframe(filtered_df, use_container_width=True)

    csv_data = filtered_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 Export Filtered Trades CSV",
        data=csv_data,
        file_name="apex_edge_slice_trades.csv",
        mime="text/csv",
    )
else:
    st.info("No trade records available for slice analytics.")
