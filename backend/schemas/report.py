from pydantic import BaseModel
from typing import Dict
from backend.models.ticket import TicketPriority

class ReportSummaryResponse(BaseModel):
    total_tickets: int
    open_tickets: int
    closed_tickets: int
    priority_breakdown: Dict[TicketPriority, int]

    class Config:
        from_attributes = True
