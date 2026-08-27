# app/routers/deficit.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.deficit import DeficitMonthlyResponse
from app.services.deficit import DeficitService

router = APIRouter(tags=["deficit"])


@router.get("/deficit/monthly", response_model=DeficitMonthlyResponse)
def get_monthly_deficit(
    year: int = Query(..., description="Year (e.g. 2026)"),
    month: int = Query(..., description="Month (1-12)"),
    db: Session = Depends(get_db),
):
    return DeficitService.calculate_monthly_deficit(db, year, month)
