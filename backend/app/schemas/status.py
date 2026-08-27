# app/schemas/status.py
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
import uuid


class StatusCheckCreate(BaseModel):
    client_name: str


class StatusCheckOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime
