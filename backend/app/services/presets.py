# app/services/presets.py
import datetime
import uuid
from typing import List
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import MealSegment
from app.models.models import Meal, Preset
from app.schemas.meals import MealOut
from app.schemas.presets import PresetCreate, PresetLog, PresetOut, PresetRename
from app.services.meals import _to_out as _meal_to_out


def _preset_to_out(preset: Preset) -> PresetOut:
    return PresetOut(
        id=preset.id,
        name=preset.name,
        meal_text=preset.meal_text,
        calories=round(float(preset.calories)),
        protein=round(float(preset.protein), 1),
        carbs=round(float(preset.carbs), 1),
        fibre=round(float(preset.fibre), 1),
        fats=round(float(preset.fats), 1),
        confidence=preset.confidence,
        use_count=preset.use_count,
        created_at=preset.created_at.isoformat() if preset.created_at else datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )


class PresetService:
    @staticmethod
    def list_presets(db: Session) -> List[PresetOut]:
        stmt = select(Preset).order_by(Preset.use_count.desc(), Preset.created_at.desc())
        presets = db.scalars(stmt).all()
        return [_preset_to_out(p) for p in presets]

    @staticmethod
    def create_preset(db: Session, data: PresetCreate) -> PresetOut:
        preset = Preset(
            id=str(uuid.uuid4()),
            name=(data.name or "").strip() or None,
            meal_text=data.meal_text,
            calories=data.calories,
            protein=data.protein,
            carbs=data.carbs,
            fibre=data.fibre,
            fats=data.fats,
            confidence=data.confidence,
            use_count=0,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(preset)
        db.commit()
        db.refresh(preset)
        return _preset_to_out(preset)

    @staticmethod
    def delete_preset(db: Session, preset_id: str) -> dict:
        preset = db.get(Preset, preset_id)
        if not preset:
            raise HTTPException(status_code=404, detail="Preset not found")
        db.delete(preset)
        db.commit()
        return {"deleted": True}

    @staticmethod
    def rename_preset(db: Session, preset_id: str, data: PresetRename) -> dict:
        preset = db.get(Preset, preset_id)
        if not preset:
            raise HTTPException(status_code=404, detail="Preset not found")
        name = (data.name or "").strip() or None
        preset.name = name
        preset.updated_at = datetime.datetime.now(datetime.timezone.utc)
        db.commit()
        return {"id": preset_id, "name": name}

    @staticmethod
    def log_preset(db: Session, preset_id: str, data: PresetLog) -> MealOut:
        try:
            segment_enum = MealSegment(data.segment)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid meal segment")

        preset = db.get(Preset, preset_id)
        if not preset:
            raise HTTPException(status_code=404, detail="Preset not found")

        meal = Meal(
            id=str(uuid.uuid4()),
            meal_text=preset.meal_text,
            segment=segment_enum,
            date=data.date,
            calories=preset.calories,
            protein=preset.protein,
            carbs=preset.carbs,
            fibre=preset.fibre,
            fats=preset.fats,
            confidence=preset.confidence,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        preset.use_count += 1
        preset.updated_at = datetime.datetime.now(datetime.timezone.utc)
        
        db.add(meal)
        db.commit()
        db.refresh(meal)
        return _meal_to_out(meal)
