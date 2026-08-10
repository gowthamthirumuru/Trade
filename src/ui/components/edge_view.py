"""
Edge Explorer Component Renderer.

Renders Page 3 Edge Explorer slice statistics, significance badges, and cross-tabulation metrics (§18.3 & §18.4).
"""

from typing import Any, Dict


def render_edge_view(data: Dict[str, Any]) -> str:
    """Renders Page 3 Edge Explorer summary markup with significance badges (§18.3).

    Args:
        data (Dict[str, Any]): Edge Explorer data dictionary from load_edge_explorer_data().

    Returns:
        str: Formatted markdown string summarizing Edge Explorer state.
    """
    stats = data.get("slice_stats", {})
    badge = data.get("significance_badge", {})
    load_time = data.get("load_time_sec", 0.0)

    n_samples = stats.get("n", 0)
    exp_r = stats.get("expectancy_r", 0.0)
    win_rate = stats.get("win_rate", 0.0) * 100.0
    pf = stats.get("profit_factor", 0.0)
    p_adj = badge.get("p_adj", 1.0)
    stable = badge.get("stable", False)

    summary = f"""### 🔬 Edge Explorer & Slicing Engine (Load Time: `{load_time:.3f}s`)

#### Slice Significance Badges:
- **Sample Size (n)**: `{n_samples}` trades (Minimum Required: 100)
- **Expectancy E[R]**: `+{exp_r:.2f}R` net of costs
- **Win Rate / PF**: `{win_rate:.1f}%` | Profit Factor: `{pf:.2f}`
- **FDR Adjusted p-value (p_adj)**: `{p_adj:.4f}` ({'SIGNIFICANT (p <= 0.05)' if p_adj <= 0.05 else 'NOT SIGNIFICANT'})
- **Both-Halves Stability**: `{'STABLE' if stable else 'UNSTABLE'}`
"""
    return summary
