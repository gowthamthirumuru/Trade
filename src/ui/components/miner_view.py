"""
Miner Control Component Renderer.

Renders Page 2 Miner Control leaderboard, survival funnel, and run history (§18.3).
"""

from typing import Any, Dict
import pandas as pd


def render_miner_view(data: Dict[str, Any]) -> str:
    """Renders Page 2 Miner Control summary markup (§18.3).

    Args:
        data (Dict[str, Any]): Miner data dictionary from load_miner_data().

    Returns:
        str: Formatted markdown string summarizing Miner state.
    """
    funnel = data.get("funnel_stats", {})
    history = data.get("run_history", pd.DataFrame())
    leaderboard = data.get("leaderboard", pd.DataFrame())
    load_time = data.get("load_time_sec", 0.0)

    summary = f"""### ⛏️ Strategy Miner Control & Survival Funnel (Load Time: `{load_time:.3f}s`)

- **Variants Tested**: `{funnel.get('tested', 0):,}`
- **Candidates Screened**: `{funnel.get('screened', 0):,}`
- **Validated Strategies**: `{funnel.get('validated', 0):,}`
- **Live / Core Roster**: `{funnel.get('live', 0):,}`

---
#### Mining Leaderboard:
"""
    if not leaderboard.empty:
        for idx, row in leaderboard.head(5).iterrows():
            summary += f"\n- **Rank {idx+1}**: `{row.get('strategy')}` | n=`{row.get('n_trades', 0)}` trades | E[R] = `+{row.get('exp_r', 0.0):.2f}R`"
    else:
        summary += "\n*No mining runs registered in DuckDB yet.*"

    return summary
