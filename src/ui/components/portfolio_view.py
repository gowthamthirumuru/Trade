"""
Portfolio View Component Renderer.

Renders Page 5 Portfolio allocations, HRP weights, and correlation heatmaps (§18.3).
"""

from typing import Any, Dict


def render_portfolio_view(data: Dict[str, Any]) -> str:
    """Renders Page 5 Portfolio summary markup (§18.3).

    Args:
        data (Dict[str, Any]): Portfolio data dictionary from load_portfolio_data().

    Returns:
        str: Formatted markdown string summarizing Portfolio state.
    """
    weights = data.get("weights", {})
    load_time = data.get("load_time_sec", 0.0)

    summary = f"""### 💼 Portfolio Construction Engine — Active Allocations (Load Time: `{load_time:.3f}s`)

- **Allocation Method**: `Hierarchical Risk Parity (HRP)`
- **Strategy Weight Cap**: `30.0%`
- **Asset Pair Concentration Cap**: `40.0%`
- **Correlation Guard Threshold**: `0.60` (Halve combined)

---
#### Current Strategy Weights:
"""
    if weights:
        for s, w in weights.items():
            summary += f"\n- `{s}`: `{w*100:.2f}%`"
    else:
        summary += "\n*No strategy allocations calculated yet.*"

    return summary
