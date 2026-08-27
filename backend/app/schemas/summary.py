# app/schemas/summary.py
from typing import Dict, List, Optional
from pydantic import BaseModel


class SegmentMealItem(BaseModel):
    id: str
    meal_text: str
    calories: float


class DaySummary(BaseModel):
    date: str
    day: int
    calories: float
    protein: float
    carbs: float
    fibre: float
    fats: float
    steps: int
    segments: Dict[str, List[SegmentMealItem]]


class MonthlySummaryResponse(BaseModel):
    year: int
    month: int
    days: List[DaySummary]
