"""
Execution & Live Loop Access API Layer.

Official contract functions `generate_edge_alert_payload()`, `validate_pretrade_checklist()`,
`place_testnet_order()`, `execute_kill_switch()`, and `calibrate_slippage()` (§C2.5).

Context:
    Layer 11 (Execution & Live Loop) public API contract specified in Master Plan §C2.5.
"""

import logging
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from src.execution.alerts import generate_edge_alert_payload as internal_generate_edge_alert_payload
from src.execution.alerts import send_telegram_alert as internal_send_telegram_alert
from src.execution.protocol import check_protocol_lockout as internal_check_protocol_lockout
from src.execution.protocol import record_trade_violation as internal_record_trade_violation
from src.execution.protocol import validate_pretrade_checklist as internal_validate_pretrade_checklist
from src.execution.slippage_calibration import calibrate_slippage as internal_calibrate_slippage
from src.execution.testnet_bridge import execute_kill_switch as internal_execute_kill_switch
from src.execution.testnet_bridge import place_testnet_order as internal_place_testnet_order

logger = logging.getLogger(__name__)


def generate_edge_alert_payload(
    card_dict: Dict[str, Any],
    equity: float = 10000.0,
    stop_distance_pct: float = 0.02,
    entry_price: float = 100.0,
    portfolio_weight: float = 1.0,
) -> Dict[str, Any]:
    """Generates structured alert payload for an active Edge Card (§C2.5)."""
    return internal_generate_edge_alert_payload(
        card_dict=card_dict,
        equity=equity,
        stop_distance_pct=stop_distance_pct,
        entry_price=entry_price,
        portfolio_weight=portfolio_weight,
    )


def validate_pretrade_checklist(
    card_id: Optional[int],
    conditions_verified: bool,
    news_blackout_clear: bool,
    risk_engine_size_ok: bool,
    emotion_score: int,
) -> Dict[str, Any]:
    """Validates mandatory 5-point pre-trade protocol checklist (§C2.5)."""
    return internal_validate_pretrade_checklist(
        card_id=card_id,
        conditions_verified=conditions_verified,
        news_blackout_clear=news_blackout_clear,
        risk_engine_size_ok=risk_engine_size_ok,
        emotion_score=emotion_score,
    )


def place_testnet_order(
    symbol: str,
    side: str,
    qty: float,
    price: float = 100.0,
    slippage_bps: float = 2.0,
    fee_bps: float = 5.0,
    testnet: bool = True,
) -> Dict[str, Any]:
    """Places or simulates an order on Binance Testnet (§C2.5)."""
    return internal_place_testnet_order(
        symbol=symbol,
        side=side,
        qty=qty,
        price=price,
        slippage_bps=slippage_bps,
        fee_bps=fee_bps,
        testnet=testnet,
    )


def execute_kill_switch(db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Flattens all positions, disarms alerts, and logs emergency lockout (§C2.5)."""
    return internal_execute_kill_switch(db_path=db_path)


def calibrate_slippage(
    trades_df: Optional[pd.DataFrame] = None,
    db_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Generates monthly slippage calibration metrics and report (§C2.5)."""
    return internal_calibrate_slippage(trades_df=trades_df, db_path=db_path)
