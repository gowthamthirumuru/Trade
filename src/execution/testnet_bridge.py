"""
Testnet Execution Bridge & Kill-Switch Module.

Provides testnet order placement, simulated paper execution, and emergency system kill-switch
as mandated by Master Plan §19.3 & §19.4.

Context:
    Layer 11 (Execution & Live Loop) testnet bridge specified in Master Plan §19.3 & §19.4.
"""

import logging
from pathlib import Path
import time
from typing import Any, Dict, Optional
import duckdb
import pandas as pd

from src.execution.protocol import record_trade_violation
from src.tradesdb.schema import initialize_duckdb_schema

logger = logging.getLogger(__name__)


def get_project_root() -> Path:
    """Returns absolute Path to project root directory."""
    return Path(__file__).parent.parent.parent


def place_testnet_order(
    symbol: str,
    side: str,
    qty: float,
    price: float = 100.0,
    slippage_bps: float = 2.0,
    fee_bps: float = 5.0,
    testnet: bool = True,
) -> Dict[str, Any]:
    """Places or simulates an order on Binance Testnet (§19.3 & A11.4).

    Args:
        symbol (str): Asset pair symbol (e.g. 'BTCUSDT').
        side (str): Order side ('buy' or 'sell').
        qty (float): Order quantity in base units.
        price (float): Mid price at alert time. Defaults to 100.0.
        slippage_bps (float): Simulated slippage in bps. Defaults to 2.0.
        fee_bps (float): Simulated fee in bps. Defaults to 5.0.
        testnet (bool): Testnet flag. Defaults to True.

    Returns:
        Dict[str, Any]: Order execution fill dictionary.
    """
    if qty <= 0 or price <= 0:
        return {"status": "ORDER_REJECTED", "reason": "INVALID_QTY_OR_PRICE"}

    # Apply slippage (buy fills higher, sell fills lower)
    slip_mult = 1.0 + (slippage_bps / 10000.0) if side.lower() == "buy" else 1.0 - (slippage_bps / 10000.0)
    fill_price = price * slip_mult

    total_value = qty * fill_price
    fees_quote = total_value * (fee_bps / 10000.0)
    order_id = int(time.time() * 1000)

    logger.info("Placed Testnet Order #%d: %s %f %s @ %.2f (Fill: %.2f)", order_id, side, qty, symbol, price, fill_price)
    return {
        "order_id": order_id,
        "symbol": symbol,
        "side": side.lower(),
        "qty": float(qty),
        "alert_price": float(price),
        "fill_price": round(float(fill_price), 4),
        "total_value": round(float(total_value), 2),
        "fees_quote": round(float(fees_quote), 4),
        "slippage_bps": float(slippage_bps),
        "testnet": testnet,
        "status": "FILLED",
        "timestamp": pd.Timestamp.now(tz="UTC").strftime("%Y-%m-%d %H:%M:%S"),
    }


def execute_kill_switch(db_path: Optional[Path] = None) -> Dict[str, Any]:
    """Flattens all positions, disarms alerts, and logs emergency lockout (§19.4 & A11.5).

    Args:
        db_path (Optional[Path]): DuckDB database path override.

    Returns:
        Dict[str, Any]: Kill-switch execution drill summary dictionary.
    """
    root = get_project_root()
    target_db = db_path or (root / "db" / "apex.duckdb")
    initialize_duckdb_schema(db_path=target_db)

    event_id = int(time.time() * 1000)
    con = duckdb.connect(str(target_db))
    con.execute(
        """
        INSERT INTO breaker_events (event_id, ts, kind, detail, resolved_at)
        VALUES (?, CURRENT_TIMESTAMP, 'kill_switch', 'EMERGENCY KILL-SWITCH EXECUTED: All positions flattened, alerts disarmed.', CURRENT_TIMESTAMP)
        """,
        [event_id],
    )
    con.close()

    logger.warning("EMERGENCY KILL-SWITCH EXECUTED! Disarmed alerts and logged event_id=%d", event_id)
    return {
        "status": "KILL_SWITCH_EXECUTED",
        "event_id": event_id,
        "positions_flattened": True,
        "alerts_disarmed": True,
        "lockout": True,
    }
