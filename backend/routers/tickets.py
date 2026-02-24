from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID

from backend.db.session import get_db
from backend.schemas.ticket import TicketCreate, TicketUpdate, TicketResponse
from backend.models.ticket import TicketStatus
from backend.services import ticket as ticket_service

router = APIRouter()

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
def create_ticket(ticket_in: TicketCreate, db: Session = Depends(get_db)):
    """
    Create a new ticket.
    """
    try:
        return ticket_service.create_ticket(db=db, ticket_in=ticket_in)
    except IntegrityError as e:
        if "tickets_assigned_to_fkey" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The assigned_to team member does not exist."
            )
        raise e

@router.get("/", response_model=List[TicketResponse])
def read_tickets(
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[TicketStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Retrieve tickets. Optionally filter by status.
    """
    tickets = ticket_service.get_tickets(db, skip=skip, limit=limit, status=status_filter)
    return tickets

@router.get("/{ticket_id}", response_model=TicketResponse)
def read_ticket(ticket_id: UUID, db: Session = Depends(get_db)):
    """
    Get ticket by ID.
    """
    db_ticket = ticket_service.get_ticket(db, ticket_id=ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return db_ticket

@router.put("/{ticket_id}", response_model=TicketResponse)
def update_ticket(ticket_id: UUID, ticket_in: TicketUpdate, db: Session = Depends(get_db)):
    """
    Update ticket based on ID. Fields not provided will be ignored.
    """
    db_ticket = ticket_service.get_ticket(db, ticket_id=ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    db_ticket = ticket_service.update_ticket(db, db_ticket=db_ticket, ticket_in=ticket_in)
    return db_ticket

@router.delete("/{ticket_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ticket(ticket_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a ticket.
    """
    db_ticket = ticket_service.get_ticket(db, ticket_id=ticket_id)
    if db_ticket is None:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket_service.delete_ticket(db, db_ticket=db_ticket)
    return None
