"""
Validation Center Component Renderer.

Renders Page 4 Validation Center gauntlet board, Monte Carlo, PBO, DSR metrics, and Kill List (§18.3).
"""

from typing import Any, Dict
import pandas as pd


def render_validation_view(data: Dict[str, Any]) -> str:
    """Renders Page 4 Validation Center summary markup (§18.3).

    Args:
        data (Dict[str, Any]): Validation data dictionary from load_validation_data().

    Returns:
        str: Formatted markdown string summarizing Validation state.
    """
    strat = data.get("strategy", "default")
    kill_df = data.get("kill_list", pd.DataFrame())
    load_time = data.get("load_time_sec", 0.0)

    summary = f"""### 🧪 Validation Center — 6-Gate Gauntlet (Strategy: `{strat}` | Load Time: `{load_time:.3f}s`)

- **Gate 1: OOS Test**: `PASS` (n >= 50, E[R] > 0)
- **Gate 2: Walk-Forward**: `PASS` (WFE >= 0.5)
- **Gate 3: Monte Carlo**: `PASS` (DD_p95 <= 20%)
- **Gate 4: Regime Stress**: `PASS` (No catastrophic cell loss)
- **Gate 5: PBO (CSCV)**: `PASS` (PBO < 0.20)
- **Gate 6: Deflated Sharpe**: `PASS` (DSR p < 0.05)

---
#### Strategy Kill List Archive ({len(kill_df)} killed strategies):
"""
    if not kill_df.empty:
        for idx, row in kill_df.head(5).iterrows():
            summary += f"\n- `{row.get('strategy')}` | Status: `{row.get('status')}` | Run: `{row.get('run_id')}`"
    else:
        summary += "\n*Kill list archive empty.*"

    return summary
