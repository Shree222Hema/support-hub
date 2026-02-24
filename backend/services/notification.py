import logging
import requests
from threading import Thread

from backend.core.config import settings
from backend.models.ticket import Ticket

logger = logging.getLogger(__name__)

def _send_webhook_sync(ticket: Ticket) -> None:
    webhook_url = settings.GOOGLE_CHAT_WEBHOOK_URL
    if not webhook_url:
        logger.info("GOOGLE_CHAT_WEBHOOK_URL is not set. Skipping notification.")
        return

    # Google Chat webhook payload format requires a 'text' field
    message = {
        "text": (
            f"🎫 *New Ticket Created*\n\n"
            f"*ID:* {ticket.id}\n"
            f"*Title:* {ticket.title}\n"
            f"*Priority:* {ticket.priority.value if hasattr(ticket.priority, 'value') else ticket.priority}\n"
            f"*Status:* {ticket.status.value if hasattr(ticket.status, 'value') else ticket.status}"
        )
    }

    try:
        response = requests.post(webhook_url, json=message, timeout=5.0)
        response.raise_for_status()
        logger.info(f"Google Chat notification sent successfully for Ticket '{ticket.id}'")
    except requests.exceptions.RequestException as e:
        # We catch the exception and simply log it so it doesn't break the application flow
        logger.error(f"Failed to send Google Chat notification: {e}")

def send_new_ticket_notification(ticket: Ticket) -> None:
    """
    Triggers a Google Chat notification asynchronously so it doesn't block the API response.
    Catches and logs all connection errors gracefully.
    """
    # Fire and forget in a background thread to prevent slow webhooks from lagging API response
    thread = Thread(target=_send_webhook_sync, args=(ticket,))
    thread.start()
