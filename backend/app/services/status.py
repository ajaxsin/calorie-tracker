# app/services/status.py
import datetime
import uuid
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import StatusCheck
from app.schemas.status import StatusCheckCreate, StatusCheckOut


class StatusService:
    @staticmethod
    def create_status_check(db: Session, data: StatusCheckCreate) -> StatusCheckOut:
        status_obj = StatusCheck(
            id=str(uuid.uuid4()),
            client_name=data.client_name,
            timestamp=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(status_obj)
        db.commit()
        db.refresh(status_obj)
        return StatusCheckOut(
            id=status_obj.id,
            client_name=status_obj.client_name,
            timestamp=status_obj.timestamp,
        )

    @staticmethod
    def get_status_checks(db: Session) -> List[StatusCheckOut]:
        stmt = select(StatusCheck).order_by(StatusCheck.timestamp.desc()).limit(100)
        checks = db.scalars(stmt).all()
        return [
            StatusCheckOut(id=c.id, client_name=c.client_name, timestamp=c.timestamp)
            for c in checks
        ]
