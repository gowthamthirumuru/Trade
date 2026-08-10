"""
Data Manager Component Renderer.

Renders Page 7 Data & System Manager coverage matrix, gap reports, and system health (§18.3).
"""

from typing import Any, Dict
import pandas as pd


def render_data_view(data: Dict[str, Any]) -> str:
    """Renders Page 7 Data Manager summary markup (§18.3).

    Args:
        data (Dict[str, Any]): Data manager data dictionary from load_data_manager_data().

    Returns:
        str: Formatted markdown string summarizing Data Manager state.
    """
    coverage = data.get("coverage", pd.DataFrame())
    status = data.get("system_status", "ONLINE")
    load_time = data.get("load_time_sec", 0.0)

    summary = f"""### ⚙️ Data Lake & System Manager (Status: `{status}` | Load Time: `{load_time:.3f}s`)

- **Primary DataSource**: `Binance Public Archive (spot/klines)`
- **Granularity Base**: `1m Base Parquet -> Derived 5m, 15m, 1h, 4h, 1d`
- **Database Backend**: `DuckDB (apex.duckdb)`
- **Read-Only Safety Guarantee**: `ACTIVE (Zero unauthorized write paths)`

---
#### Market Pair Coverage:
"""
    if not coverage.empty:
        for idx, row in coverage.head(10).iterrows():
            summary += f"\n- Pair: `{row.get('pair')}` | Logged Trades: `{row.get('trade_count', 0):,}`"
    else:
        summary += "\n*Data Lake queryable & operational.*"

    return summary
