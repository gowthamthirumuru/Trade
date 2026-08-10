"""
Layer 11 Execution & Live Loop Module.

Telegram alert generation, pre-trade protocol checklist validator, Binance testnet bridge,
emergency kill-switch, and monthly slippage calibration engine.
"""

from src.execution.api import (
    calibrate_slippage,
    execute_kill_switch,
    generate_edge_alert_payload,
    place_testnet_order,
    validate_pretrade_checklist,
)
from src.execution.protocol import check_protocol_lockout, record_trade_violation

__all__ = [
    "generate_edge_alert_payload",
    "validate_pretrade_checklist",
    "place_testnet_order",
    "execute_kill_switch",
    "calibrate_slippage",
    "record_trade_violation",
    "check_protocol_lockout",
]
