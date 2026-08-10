"""
Backtest Engine Cost & Fill Model Configuration.

Defines cost structures, slippage models, and fill rules as mandated by Master Plan §12.3.

Rules (§12.3):
    - Taker fee: 5 bps per side (0.05%)
    - Slippage: 2 bps per side (0.02%)
    - Next-bar open fill: Signal at bar t executes at open of t+1 (no same-bar fills)
    - Intrabar conservative rule: If SL and TP are both inside bar range, SL hit first.

Context:
    Layer 4 (Backtest Engine) configuration contract specified in Master Plan §12.3.
"""

from dataclasses import dataclass, field
import yaml
from pathlib import Path
from typing import Optional


@dataclass
class BacktestCostConfig:
    """Backtest transaction cost model parameters (§12.3)."""

    fee_model: str = "taker_bps"
    taker_fee_bps: float = 5.0      # 0.05% per side
    slippage_model: str = "fixed_bps"
    slippage_bps: float = 2.0       # 2 bps per side

    @property
    def round_trip_cost_pct(self) -> float:
        """Returns total round-trip cost as a percentage fraction (e.g. 0.0014 for 14 bps)."""
        return ((self.taker_fee_bps * 2.0) + (self.slippage_bps * 2.0)) / 10000.0


@dataclass
class FillRulesConfig:
    """Backtest fill execution rules (§12.3)."""

    entry_fill: str = "next_bar_open"           # 'next_bar_open' -> fill at open of t+1
    stop_loss_rule: str = "intrabar_conservative" # 'intrabar_conservative' -> SL hit first
    partial_exits: bool = True


@dataclass
class BacktestEngineConfig:
    """Master configuration container for Backtest Engine."""

    costs: BacktestCostConfig = field(default_factory=BacktestCostConfig)
    fills: FillRulesConfig = field(default_factory=FillRulesConfig)


def load_backtest_config(config_path: Optional[Path] = None) -> BacktestEngineConfig:
    """Loads backtest configuration from system.yaml or custom YAML file.

    Args:
        config_path (Optional[Path]): Path to YAML config file.

    Returns:
        BacktestEngineConfig: Loaded configuration object.
    """
    if config_path is None or not config_path.exists():
        return BacktestEngineConfig()

    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    costs_data = data.get("costs", {})
    costs = BacktestCostConfig(
        fee_model=costs_data.get("fee_model", "taker_bps"),
        taker_fee_bps=float(costs_data.get("taker_fee_bps", 5.0)),
        slippage_model=costs_data.get("slippage_model", "fixed_bps"),
        slippage_bps=float(costs_data.get("slippage_bps", 2.0)),
    )

    fills_data = data.get("fills", {})
    fills = FillRulesConfig(
        entry_fill=fills_data.get("entry", "next_bar_open"),
        stop_loss_rule=fills_data.get("stop_loss", "intrabar_conservative"),
        partial_exits=bool(fills_data.get("partial_exits", True)),
    )

    return BacktestEngineConfig(costs=costs, fills=fills)
