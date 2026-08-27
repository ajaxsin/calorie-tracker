# app/routers/settings.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.settings import SettingsInput, SettingsOut
from app.services.settings import SettingsService

router = APIRouter(tags=["settings"])


@router.get("/settings", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return SettingsService.get_settings(db)


@router.put("/settings", response_model=SettingsOut)
def update_settings(payload: SettingsInput, db: Session = Depends(get_db)):
    return SettingsService.update_settings(db, payload)
