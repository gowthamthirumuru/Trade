"""
Page 2 — Miner Control Page.
"""

from pathlib import Path
import sys
import streamlit as st

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from src.ui.data_loader import load_miner_data

st.set_page_config(page_title="APEX — Miner Control", page_icon="🛠️", layout="wide")

st.title("🛠️ Strategy Miner & Genetic Evolution Control")
st.caption("Combinatorial Brute-Force (Miner-1), Genetic Expression Trees (Miner-2), and ML Classifiers (Miner-3)")

data = load_miner_data()
funnel = data.get("funnel_stats", {})
runs_df = data.get("run_history", pd.DataFrame())
leaderboard = data.get("leaderboard", pd.DataFrame())

col1, col2, col3, col4 = st.columns(4)
col1.metric("Total Variants Tested", f"{funnel.get('tested', 0):,}")
col2.metric("Screened Candidates", f"{funnel.get('screened', 0)}")
col3.metric("Validated Strategies", f"{funnel.get('validated', 0)}")
col4.metric("Live Approved", f"{funnel.get('live', 0)}")

st.subheader("🏆 Strategy Leaderboard")
if not leaderboard.empty:
    st.dataframe(leaderboard, use_container_width=True)
else:
    st.info("No strategy leaderboard records available.")

st.subheader("📜 Complete Mining Run History")
if not runs_df.empty:
    st.dataframe(runs_df, use_container_width=True)
else:
    st.info("No mining runs registered in DuckDB.")
