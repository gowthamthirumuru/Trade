"""
Overview Dashboard Component Renderer.

Renders Page 1 Overview view metrics, equity curves, active Edge Cards, and risk status (§18.3).
"""

from typing import Any, Dict
import pandas as pd


def render_overview_view(data: Dict[str, Any]) -> str:
    """Renders Page 1 Overview view summary markup and metrics (§18.3).

    Args:
        data (Dict[str, Any]): Overview data dictionary from load_overview_data().

    Returns:
        str: Formatted markdown string summarizing Overview state.
    """
    eq_df = data.get("equity_curve", pd.DataFrame())
    cards = data.get("active_cards", [])
    risk = data.get("risk_status", {})
    health = data.get("system_health", {})
    load_time = data.get("load_time_sec", 0.0)

    n_trades = len(eq_df)
    current_equity = float(eq_df["equity"].iloc[-1]) if not eq_df.empty and "equity" in eq_df.columns else 10000.0
    current_dd_pct = float(risk.get("current_dd", 0.0)) * 100.0
    active_cards_count = len(cards)

    summary = f"""### 🏠 System Overview (Period: 2017-Present | n={n_trades} trades)

- **Current Portfolio Equity**: `${current_equity:,.2f}` (Band: Expectation 1.0x-1.5x)
- **Current Drawdown**: `{current_dd_pct:.2f}%` (Max Allowed: 12.0%)
- **Active Edge Cards Today**: `{active_cards_count}` Cards Active
- **Circuit Breakers Status**: `{'ARMED/TRIPPED' if risk.get('breakers_armed') else 'ALL CLEAR'}`
- **System Health**: `{health.get('data_freshness', 'OK')}` (Load Time: `{load_time:.3f}s`)

---
#### Active Setup Edge Cards:
"""
    if cards:
        for idx, card in enumerate(cards[:5]):
            summary += f"\n- **Card #{card.get('card_id', idx+1)}** | Strategy: `{card.get('strategy')}` | Pair: `{card.get('pair')}` | E[R]: `+{card.get('expectancy_r', 0.0):.2f}R` (n={card.get('n_trades', 0)})"
    else:
        summary += "\n*No active Edge Cards for current session window.*"

    return summary
