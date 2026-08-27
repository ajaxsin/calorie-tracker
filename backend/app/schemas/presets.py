# app/schemas/presets.py
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class PresetCreate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=60)
    meal_text: str = Field(min_length=1, max_length=2000)
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


class PresetRename(BaseModel):
    name: Optional[str] = Field(default=None, max_length=60)


class PresetLog(BaseModel):
    date: str
    segment: str


class PresetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: Optional[str] = None
    meal_text: str
    calories: float
    protein: float
    carbs: float
    fibre: float
    fats: float
    confidence: Optional[float] = None
    use_count: int = 0
    created_at: str
