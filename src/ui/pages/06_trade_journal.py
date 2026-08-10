"""
Page 6 — Trade Journal Page.
"""

from pathlib import Path
import sys
import streamlit as st

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import pandas as pd
from src.ui.data_loader import load_journal_data, submit_journal_entry

st.set_page_config(page_title="APEX — Trade Journal", page_icon="📓", layout="wide")

st.title("📓 Trade Journal & Pre-Trade Execution Checklist")
st.caption("Pre-Trade Checklist Validation, Emotion Score Logging & Live-vs-Backtest Drift Tracking")

data = load_journal_data()
trades_df = data.get("journal_trades", pd.DataFrame())

st.subheader("✍️ Submit New Trade Journal & Pre-Trade Checklist")

if not trades_df.empty:
    trade_ids = list(trades_df["trade_id"].unique())
    col1, col2, col3 = st.columns(3)

    target_id = col1.selectbox("Target Trade ID", trade_ids)
    chk_ok = col2.checkbox("Pre-Trade Checklist Complete (Card, Sizing, SL set)", value=True)
    emotion = col3.slider("Operator Emotion Score (1=Calm, 5=Panic)", min_value=1, max_value=5, value=1)
    notes = st.text_area("Trade Notes & Market Context", placeholder="Entered on session breakout signal...")

    if st.button("💾 Submit Journal Entry"):
        res = submit_journal_entry(trade_id=int(target_id), checklist_ok=chk_ok, emotion_score=int(emotion), notes=notes)
        if res:
            st.success(f"Successfully journaled Trade #{target_id}!")
            st.rerun()
        else:
            st.error("Failed to submit journal entry to DuckDB.")

st.subheader("📜 Submitted Journal Records")
if not trades_df.empty:
    st.dataframe(trades_df, use_container_width=True)
else:
    st.info("No trade journal records currently logged.")
