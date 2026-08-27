# app/schemas/estimate.py
from typing import List, Optional
from pydantic import BaseModel, Field


class EstimateRequest(BaseModel):
    meal_text: str = Field(min_length=1, max_length=2000)


class BreakdownItem(BaseModel):
    item: str
    calories: float
    protein: float
    carbs: float
    fibre: float
    fats: float


class EstimateResponse(BaseModel):
    calories: float
    protein: float
    carbs: float
    fibre: float
    fats: float
    confidence: Optional[float] = 0.85
    note: Optional[str] = None
    breakdown: Optional[List[BreakdownItem]] = None
