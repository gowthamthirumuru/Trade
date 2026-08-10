"""
Execution Alert Engine Module.

Formats actionable Edge Card alert payloads and dispatches Telegram notifications as mandated by Master Plan §19.2.

Alert Payload Format (§19.2):
    "EDGE #{card_id} active now — {pair} {tf} {strategy}, conditions met. Size: {risk_pct}% risk = {qty} units. Invalid below {invalidation_price}."

Context:
    Layer 11 (Execution & Live Loop) alert engine specified in Master Plan §19.2.
"""

import logging
from typing import Any, Dict, Optional

from src.risk.sizing import calculate_position_size

logger = logging.getLogger(__name__)


def generate_edge_alert_payload(
    card_dict: Dict[str, Any],
    equity: float = 10000.0,
    stop_distance_pct: float = 0.02,
    entry_price: float = 100.0,
    portfolio_weight: float = 1.0,
) -> Dict[str, Any]:
    """Generates structured alert payload for an active Edge Card (§19.2).

    Args:
        card_dict (Dict[str, Any]): Edge Card dictionary representation.
        equity (float): Current portfolio equity. Defaults to 10000.0.
        stop_distance_pct (float): Stop distance percentage. Defaults to 0.02.
        entry_price (float): Current asset price. Defaults to 100.0.
        portfolio_weight (float): Module 8 portfolio allocation weight. Defaults to 1.0.

    Returns:
        Dict[str, Any]: Formatted alert payload dictionary.
    """
    card_id = card_dict.get("card_id", 1)
    strategy = card_dict.get("strategy", "strat_unknown")
    pair = card_dict.get("pair", "BTCUSDT")
    timeframe = card_dict.get("timeframe", "1h")

    # Compute risk-budgeted position size
    sizing = calculate_position_size(
        equity=equity,
        stop_distance_pct=stop_distance_pct,
        entry_price=entry_price,
        portfolio_weight=portfolio_weight,
    )

    invalidation_price = round(entry_price * (1.0 - stop_distance_pct), 2)
    risk_pct_str = f"{sizing['risk_pct'] * 100:.2f}%"

    message_text = (
        f"EDGE #{card_id} active now — {pair} {timeframe} {strategy}, conditions met. "
        f"Size: {risk_pct_str} risk = {sizing['qty']} units. Invalid below {invalidation_price}."
    )

    logger.info("Generated Edge Alert Payload: %s", message_text)
    return {
        "card_id": card_id,
        "strategy": strategy,
        "pair": pair,
        "timeframe": timeframe,
        "message_text": message_text,
        "sizing": sizing,
        "invalidation_price": invalidation_price,
        "status": "ALERT_GENERATED",
    }


def send_telegram_alert(
    payload: Dict[str, Any],
    bot_token: Optional[str] = None,
    chat_id: Optional[str] = None,
) -> bool:
    """Dispatches alert message payload to Telegram or logs locally (§19.2).

    Args:
        payload (Dict[str, Any]): Alert payload from generate_edge_alert_payload().
        bot_token (Optional[str]): Telegram Bot API token.
        chat_id (Optional[str]): Telegram Chat ID.

    Returns:
        bool: Success delivery boolean flag.
    """
    msg = payload.get("message_text", "Alert")

    if bot_token and chat_id:
        try:
            import urllib.parse
            import urllib.request

            encoded_msg = urllib.parse.quote(msg)
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage?chat_id={chat_id}&text={encoded_msg}"
            req = urllib.request.Request(url, headers={"User-Agent": "ProjectAPEX/1.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                logger.info("Sent Telegram alert: HTTP %d", resp.status)
                return resp.status == 200
        except Exception as exc:
            logger.warning("Failed to send Telegram alert online, logged locally: %s", exc)
            return False

    # Offline / Unconfigured fallback logging
    logger.info("[TELEGRAM MOCK ALERT]: %s", msg)
    return True
