# app/routers/status.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.status import StatusCheckCreate, StatusCheckOut
from app.services.status import StatusService

router = APIRouter(tags=["status"])


@router.post("/status", response_model=StatusCheckOut)
def create_status_check(payload: StatusCheckCreate, db: Session = Depends(get_db)):
    return StatusService.create_status_check(db, payload)


@router.get("/status", response_model=List[StatusCheckOut])
def get_status_checks(db: Session = Depends(get_db)):
    return StatusService.get_status_checks(db)
