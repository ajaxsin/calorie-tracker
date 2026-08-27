# app/routers/meals.py
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.meals import MealCreate, MealOut
from app.services.meals import MealService

router = APIRouter(tags=["meals"])


@router.post("/meals", response_model=MealOut)
def create_meal(payload: MealCreate, db: Session = Depends(get_db)):
    return MealService.create_meal(db, payload)


@router.get("/meals", response_model=List[MealOut])
def get_meals(date: str = Query(..., description="Date in YYYY-MM-DD format"), db: Session = Depends(get_db)):
    return MealService.get_meals_by_date(db, date)


@router.delete("/meals/{meal_id}")
def delete_meal(meal_id: str, db: Session = Depends(get_db)):
    return MealService.delete_meal(db, meal_id)
