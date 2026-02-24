from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from app.models.ticket import Ticket, TicketStatus
from app.schemas.ticket import TicketCreate, TicketUpdate
from app.models.team_member import TeamMember
from fastapi import HTTPException, status
from app.services.notification import send_new_ticket_notification

def get_ticket(db: Session, ticket_id: UUID) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()

def get_tickets(db: Session, skip: int = 0, limit: int = 100, status: Optional[TicketStatus] = None) -> List[Ticket]:
    query = db.query(Ticket)
    if status:
        query = query.filter(Ticket.status == status)
    return query.offset(skip).limit(limit).all()

def create_ticket(db: Session, ticket_in: TicketCreate) -> Ticket:
    db_ticket = Ticket(**ticket_in.model_dump())
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    
    # Trigger Google Chat Webhook if the ticket is created as OPEN
    if db_ticket.status == TicketStatus.OPEN:
        send_new_ticket_notification(db_ticket)
        
    return db_ticket

def update_ticket(db: Session, db_ticket: Ticket, ticket_in: TicketUpdate) -> Ticket:
    update_data = ticket_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_ticket, field, value)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket

def delete_ticket(db: Session, db_ticket: Ticket) -> None:
    db.delete(db_ticket)
    db.commit()
