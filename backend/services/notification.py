import logging
import requests
from threading import Thread

from backend.core.config import settings
from backend.models.ticket import Ticket

logger = logging.getLogger(__name__)

def _send_webhook_sync(ticket: Ticket) -> None:
    logger.info(f"Background thread started to send Google Chat webhook for Ticket '{ticket.id}'")
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
        logger.error(f"Failed to send Google Chat webhook for Ticket '{ticket.id}': {e}")

def send_new_ticket_notification(ticket: Ticket) -> None:
    """
    Triggers a Google Chat notification asynchronously so it doesn't block the API response.
    Catches and logs all connection errors gracefully.
    """
    # Fire and forget in a background thread to prevent slow webhooks from lagging API response
    thread = Thread(target=_send_webhook_sync, args=(ticket,))
    thread.start()

def _send_assignment_notification_sync(ticket: Ticket, assignee_name: str, assignee_email: str) -> None:
    logger.info(f"Background thread started to send assignment notification for Ticket '{ticket.id}' to {assignee_name}")
    
    # 1. Google Chat Webhook (if configured)
    webhook_url = settings.GOOGLE_CHAT_WEBHOOK_URL
    if webhook_url:
        message = {
            "text": (
                f"👤 *Ticket Assigned*\n\n"
                f"*ID:* {ticket.id}\n"
                f"*Title:* {ticket.title}\n"
                f"*Priority:* {ticket.priority.value if hasattr(ticket.priority, 'value') else ticket.priority}\n"
                f"*Assigned To:* {assignee_name}"
            )
        }
        try:
            response = requests.post(webhook_url, json=message, timeout=5.0)
            response.raise_for_status()
            logger.info(f"Assignment Google Chat notification sent successfully for Ticket '{ticket.id}'")
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send assignment webhook for Ticket '{ticket.id}': {e}")

    # 2. Basic SMTP Email Example (Commented out but ready to use)
    """
    import smtplib
    from email.mime.text import MIMEText
    
    try:
        msg = MIMEText(
            f"Hello {assignee_name},\\n\\n"
            f"You have been assigned to a new ticket.\\n\\n"
            f"Ticket ID: {ticket.id}\\n"
            f"Title: {ticket.title}\\n"
            f"Priority: {ticket.priority.value if hasattr(ticket.priority, 'value') else ticket.priority}"
        )
        msg['Subject'] = f"Ticket Assigned: {ticket.title}"
        msg['From'] = "support@traccel.com"
        msg['To'] = assignee_email
        
        # NOTE: Use your actual SMTP server, port, and credentials here
        with smtplib.SMTP("smtp.example.com", 587) as server:
            server.starttls()
            server.login("your_email@example.com", "your_password")
            server.send_message(msg)
            logger.info(f"Assignment Email sent successfully to {assignee_email}")
    except Exception as e:
        logger.error(f"Failed to send assignment Email to {assignee_email}: {e}")
    """

def send_ticket_assignment_notification(ticket: Ticket, assignee_name: str, assignee_email: str) -> None:
    """
    Triggers an assignment notification asynchronously.
    """
    thread = Thread(target=_send_assignment_notification_sync, args=(ticket, assignee_name, assignee_email))
    thread.start()
