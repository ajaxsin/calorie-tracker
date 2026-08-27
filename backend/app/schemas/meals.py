# app/schemas/meals.py
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class MealCreate(BaseModel):
    meal_text: str = Field(min_length=1, max_length=2000)
    segment: str
    date: str
    calories: float = Field(ge=0)
    protein: float = Field(default=0.0, ge=0)
    carbs: float = Field(default=0.0, ge=0)
    fibre: float = Field(default=0.0, ge=0)
    fats: float = Field(default=0.0, ge=0)
    confidence: Optional[float] = None

    @field_validator("confidence", mode="before")
    @classmethod
    def _coerce_confidence(cls, v):
        if v is None or isinstance(v, (int, float)):
            return v
        try:
            return float(v)
        except (TypeError, ValueError):
            mapping = {
                "low": 0.3,
                "medium": 0.6,
                "med": 0.6,
                "moderate": 0.6,
                "high": 0.85,
                "very high": 0.95,
            }
            return mapping.get(str(v).strip().lower(), 0.5)


class MealOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    meal_text: str
    segment: str
    date: str
    calories: float
    protein: float
    carbs: float
    fibre: float
    fats: float
    confidence: Optional[float] = None
    created_at: str
