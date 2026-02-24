from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.schemas.report import ReportSummaryResponse

def get_report_summary(db: Session) -> ReportSummaryResponse:
    # 1. Get the total count of all tickets
    total_tickets = db.query(func.count(Ticket.id)).scalar() or 0
    
    # 2. Get the count of tickets grouped by status
    # This is much more efficient than pulling all rows into memory
    status_counts = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    status_dict = {status: count for status, count in status_counts}
    
    open_tickets = status_dict.get(TicketStatus.OPEN, 0)
    closed_tickets = status_dict.get(TicketStatus.CLOSED, 0)

    # 3. Get the priority breakdown (Bonus helpful metric!)
    priority_counts = db.query(Ticket.priority, func.count(Ticket.id)).group_by(Ticket.priority).all()
    priority_breakdown = {priority: count for priority, count in priority_counts}

    return ReportSummaryResponse(
        total_tickets=total_tickets,
        open_tickets=open_tickets,
        closed_tickets=closed_tickets,
        priority_breakdown=priority_breakdown
    )
