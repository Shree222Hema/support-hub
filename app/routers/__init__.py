from fastapi import APIRouter
from app.routers import tickets, team_members, reports

api_router = APIRouter()
api_router.include_router(tickets.router, prefix="/tickets", tags=["tickets"])
api_router.include_router(team_members.router, prefix="/team", tags=["team"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
