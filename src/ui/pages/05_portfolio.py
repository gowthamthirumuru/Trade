"""
Page 5 — Portfolio Page.
"""

from pathlib import Path
import sys
import streamlit as st

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ui.components.portfolio_view import render_portfolio_view
from src.ui.data_loader import load_portfolio_data

st.set_page_config(page_title="APEX — Portfolio Engine", page_icon="💼", layout="wide")
data = load_portfolio_data()
st.markdown(render_portfolio_view(data))
