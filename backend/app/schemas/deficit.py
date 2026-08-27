# app/schemas/deficit.py
from typing import List, Optional
from pydantic import BaseModel


class DeficitDayEntry(BaseModel):
    date: str
    day: int
    intake: float
    walking_burn: float
    burn: float
    deficit: float
    cumulative_deficit: float
    steps: int
    tracked: bool


class DeficitMonthlyResponse(BaseModel):
    year: int
    month: int
    weight_kg: Optional[float] = None
    baseline: float = 2000.0
    kcal_per_kg: float = 7700.0
    tracked_days: int
    total_intake: float
    total_burn: float
    net_deficit: float
    estimated_weight_change_kg: float
    days: List[DeficitDayEntry]
