# app/services/activity.py
import datetime
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import DailyActivity
from app.schemas.activity import ActivityInput, ActivityOut


class ActivityService:
    @staticmethod
    def get_activity(db: Session, date: str) -> ActivityOut:
        stmt = select(DailyActivity).where(DailyActivity.date == date)
        act = db.scalar(stmt)
        if not act:
            return ActivityOut(date=date, steps=0)
        return ActivityOut(date=act.date, steps=act.steps)

    @staticmethod
    def update_activity(db: Session, data: ActivityInput) -> ActivityOut:
        stmt = select(DailyActivity).where(DailyActivity.date == data.date)
        act = db.scalar(stmt)
        if not act:
            act = DailyActivity(
                date=data.date,
                steps=data.steps,
                created_at=datetime.datetime.now(datetime.timezone.utc),
                updated_at=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(act)
        else:
            act.steps = data.steps
            act.updated_at = datetime.datetime.now(datetime.timezone.utc)

        db.commit()
        db.refresh(act)
        return ActivityOut(date=act.date, steps=act.steps)
