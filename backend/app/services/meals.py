# app/services/meals.py
import datetime
import uuid
from typing import List
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import MealSegment
from app.models.models import Meal
from app.schemas.meals import MealCreate, MealOut


def _to_out(meal: Meal) -> MealOut:
    return MealOut(
        id=meal.id,
        meal_text=meal.meal_text,
        segment=meal.segment.value if isinstance(meal.segment, MealSegment) else str(meal.segment),
        date=meal.date,
        calories=round(float(meal.calories)),
        protein=round(float(meal.protein), 1),
        carbs=round(float(meal.carbs), 1),
        fibre=round(float(meal.fibre), 1),
        fats=round(float(meal.fats), 1),
        confidence=meal.confidence,
        created_at=meal.created_at.isoformat() if meal.created_at else datetime.datetime.now(datetime.timezone.utc).isoformat(),
    )


class MealService:
    @staticmethod
    def create_meal(db: Session, data: MealCreate) -> MealOut:
        try:
            segment_enum = MealSegment(data.segment)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid meal segment")

        meal = Meal(
            id=str(uuid.uuid4()),
            meal_text=data.meal_text,
            segment=segment_enum,
            date=data.date,
            calories=data.calories,
            protein=data.protein,
            carbs=data.carbs,
            fibre=data.fibre,
            fats=data.fats,
            confidence=data.confidence,
            created_at=datetime.datetime.now(datetime.timezone.utc),
            updated_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(meal)
        db.commit()
        db.refresh(meal)
        return _to_out(meal)

    @staticmethod
    def get_meals_by_date(db: Session, date: str) -> List[MealOut]:
        stmt = (
            select(Meal)
            .where(Meal.date == date)
            .order_by(Meal.created_at.desc())
        )
        meals = db.scalars(stmt).all()
        return [_to_out(m) for m in meals]

    @staticmethod
    def delete_meal(db: Session, meal_id: str) -> dict:
        meal = db.get(Meal, meal_id)
        if not meal:
            raise HTTPException(status_code=404, detail="Meal not found")
        db.delete(meal)
        db.commit()
        return {"deleted": True}
