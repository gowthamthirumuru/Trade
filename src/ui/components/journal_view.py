"""
Trade Journal Component Renderer.

Renders Page 6 Trade Journal live trades, checklist state, and drift charts (§18.3 & §18.5).
"""

from typing import Any, Dict
import pandas as pd


def render_journal_view(data: Dict[str, Any]) -> str:
    """Renders Page 6 Trade Journal summary markup (§18.3).

    Args:
        data (Dict[str, Any]): Journal data dictionary from load_journal_data().

    Returns:
        str: Formatted markdown string summarizing Journal state.
    """
    trades = data.get("journal_trades", pd.DataFrame())
    load_time = data.get("load_time_sec", 0.0)

    n_journaled = len(trades)

    summary = f"""### 📓 Trade Journal & Execution Drift (Total Journaled Trades: `{n_journaled}` | Load Time: `{load_time:.3f}s`)

- **Pre-Trade Checklist Adherence Target**: `95.0%+`
- **Emotion Score Scale**: `1 (Calm) .. 5 (Panic/Euphoria)`
- **Expectancy Drift Tolerance**: `Within 1.5 sigma of backtest`

---
#### Recent Journal Submissions:
"""
    if not trades.empty:
        for idx, row in trades.head(5).iterrows():
            summary += f"\n- Trade #{row.get('trade_id')} | `{row.get('strategy')}` | `{row.get('pair')}` | PnL: `+{row.get('pnl_r', 0.0):.2f}R` | Source: `{row.get('source', 'backtest')}`"
    else:
        summary += "\n*No trade journal submissions yet.*"

    return summary
