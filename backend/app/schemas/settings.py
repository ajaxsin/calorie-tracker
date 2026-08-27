# app/schemas/settings.py
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SettingsInput(BaseModel):
    weight_kg: float = Field(gt=0, lt=500)


class SettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    weight_kg: Optional[float] = None
    baseline_calories: float = 2000.0
