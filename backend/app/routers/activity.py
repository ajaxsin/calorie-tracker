# app/routers/activity.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.activity import ActivityInput, ActivityOut
from app.services.activity import ActivityService

router = APIRouter(tags=["activity"])


@router.get("/activity", response_model=ActivityOut)
def get_activity(date: str = Query(..., description="Date in YYYY-MM-DD format"), db: Session = Depends(get_db)):
    return ActivityService.get_activity(db, date)


@router.put("/activity", response_model=ActivityOut)
def update_activity(payload: ActivityInput, db: Session = Depends(get_db)):
    return ActivityService.update_activity(db, payload)
