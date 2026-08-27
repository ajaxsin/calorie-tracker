# app/schemas/activity.py
from pydantic import BaseModel, ConfigDict, Field


class ActivityInput(BaseModel):
    date: str
    steps: int = Field(ge=0, le=200000)


class ActivityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    date: str
    steps: int
