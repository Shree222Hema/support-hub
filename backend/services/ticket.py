from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from backend.models.ticket import Ticket, TicketStatus
from backend.schemas.ticket import TicketCreate, TicketUpdate
from backend.models.team_member import TeamMember
from fastapi import HTTPException, status
from backend.services.notification import send_new_ticket_notification, send_ticket_assignment_notification

def _check_and_notify_assignment(db: Session, ticket: Ticket) -> None:
    """Helper to fetch the assignee and send a notification if the ticket is assigned."""
    if ticket.assigned_to:
        member = db.query(TeamMember).filter(TeamMember.id == ticket.assigned_to).first()
        if member:
            send_ticket_assignment_notification(ticket, member.name, member.email)

def get_ticket(db: Session, ticket_id: UUID) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()

def get_tickets(db: Session, skip: int = 0, limit: int = 100, status: Optional[TicketStatus] = None) -> List[Ticket]:
    query = db.query(Ticket)
    if status:
        query = query.filter(Ticket.status == status)
    return query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()

def create_ticket(db: Session, ticket_in: TicketCreate) -> Ticket:
    db_ticket = Ticket(**ticket_in.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    # Trigger Google Chat Webhook if the ticket is created as OPEN
    if db_ticket.status == TicketStatus.OPEN:
        send_new_ticket_notification(db_ticket)
        
    # Trigger Assignment Notification if assigned during creation
    _check_and_notify_assignment(db, db_ticket)
        
    return db_ticket

def update_ticket(db: Session, db_ticket: Ticket, ticket_in: TicketUpdate) -> Ticket:
    update_data = ticket_in.model_dump(exclude_unset=True)
    
    # Track the old assignment before updating
    old_assigned_to = db_ticket.assigned_to
    
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    
    # Trigger notification ONLY if assigned_to was changed to a new person
    if "assigned_to" in update_data and db_ticket.assigned_to != old_assigned_to and db_ticket.assigned_to is not None:
        _check_and_notify_assignment(db, db_ticket)
        
    return db_ticket

def delete_ticket(db: Session, db_ticket: Ticket) -> None:
    db.delete(db_ticket)
    db.commit()
