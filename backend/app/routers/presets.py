# app/routers/presets.py
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.meals import MealOut
from app.schemas.presets import PresetCreate, PresetLog, PresetOut, PresetRename
from app.services.presets import PresetService

router = APIRouter(tags=["presets"])


@router.get("/presets", response_model=List[PresetOut])
def list_presets(db: Session = Depends(get_db)):
    return PresetService.list_presets(db)


@router.post("/presets", response_model=PresetOut)
def create_preset(payload: PresetCreate, db: Session = Depends(get_db)):
    return PresetService.create_preset(db, payload)


@router.delete("/presets/{preset_id}")
def delete_preset(preset_id: str, db: Session = Depends(get_db)):
    return PresetService.delete_preset(db, preset_id)


@router.patch("/presets/{preset_id}")
def rename_preset(preset_id: str, payload: PresetRename, db: Session = Depends(get_db)):
    return PresetService.rename_preset(db, preset_id, payload)


@router.post("/presets/{preset_id}/log", response_model=MealOut)
def log_preset(preset_id: str, payload: PresetLog, db: Session = Depends(get_db)):
    return PresetService.log_preset(db, preset_id, payload)
