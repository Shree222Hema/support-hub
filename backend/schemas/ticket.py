from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from backend.models.ticket import TicketStatus, TicketPriority

class TicketBase(BaseModel):
    title: str = Field(..., max_length=255)
    description: str
    status: Optional[TicketStatus] = TicketStatus.OPEN
    priority: Optional[TicketPriority] = TicketPriority.MEDIUM
    assigned_to: Optional[UUID] = None
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    user_email: Optional[str] = None
    source_app: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    status: Optional[TicketStatus] = None
    priority: Optional[TicketPriority] = None
    assigned_to: Optional[UUID] = None

class TicketResponse(TicketBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
