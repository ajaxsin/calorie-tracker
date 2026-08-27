# app/routers/summary.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.summary import MonthlySummaryResponse
from app.services.summary import SummaryService

router = APIRouter(tags=["summary"])


@router.get("/summary/monthly", response_model=MonthlySummaryResponse)
def get_monthly_summary(
    year: int = Query(..., description="Year (e.g. 2026)"),
    month: int = Query(..., description="Month (1-12)"),
    db: Session = Depends(get_db),
):
    return SummaryService.calculate_monthly_summary(db, year, month)
