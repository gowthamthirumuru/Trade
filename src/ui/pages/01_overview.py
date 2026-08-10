"""
Page 1 — Overview Page.
"""

from pathlib import Path
import sys
import streamlit as st

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from src.ui.data_loader import load_overview_data

st.set_page_config(page_title="APEX — Overview", page_icon="🏠", layout="wide")

st.title("🏠 System Overview")
st.caption("Real-Time Portfolio Equity Curve, Active Edge Cards, and Risk Status")

data = load_overview_data()
eq_df = data.get("equity_curve", pd.DataFrame())
cards = data.get("active_cards", [])
risk = data.get("risk_status", {})
health = data.get("system_health", {})

col1, col2, col3, col4, col5 = st.columns(5)
current_eq = float(eq_df["equity"].iloc[-1]) if not eq_df.empty and "equity" in eq_df.columns else 10000.0
n_total_trades = len(eq_df)

col1.metric("Portfolio Equity", f"${current_eq:,.2f}")
col2.metric("Total Backtested Trades", f"{n_total_trades}")
col3.metric("Current Drawdown", f"{float(risk.get('current_dd', 0.0))*100:.2f}%")
col4.metric("Active Edge Cards", f"{len(cards)}")
col5.metric("System Health", f"{health.get('data_freshness', 'OK')}", delta="Breakers OK")

st.subheader("📈 Portfolio Equity Curve")
if not eq_df.empty:
    st.line_chart(eq_df.set_index("entry_time")["equity"])
else:
    st.info("No trade data loaded. Run pipeline script to generate backtest trades.")

st.subheader("🎴 Active Session Edge Cards")
if cards:
    st.dataframe(pd.DataFrame(cards), use_container_width=True)
else:
    st.info("No active Edge Cards currently registered.")
