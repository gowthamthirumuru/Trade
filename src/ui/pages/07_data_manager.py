"""
Page 7 — Data Manager Page.
"""

from pathlib import Path
import sys
import streamlit as st

PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.ui.components.data_view import render_data_view
from src.ui.data_loader import load_data_manager_data

st.set_page_config(page_title="APEX — Data Manager", page_icon="⚙️", layout="wide")
data = load_data_manager_data()
st.markdown(render_data_view(data))
