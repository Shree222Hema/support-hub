from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.db.session import get_db
from backend.schemas.report import ReportSummaryResponse
from backend.services import report as report_service

router = APIRouter()

@router.get("/summary", response_model=ReportSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Retrieve an efficient summary of ticket counts for the reporting dashboard.
    """
    return report_service.get_report_summary(db)
