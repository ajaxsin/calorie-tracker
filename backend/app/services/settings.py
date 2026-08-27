# app/services/settings.py
import datetime
from sqlalchemy.orm import Session

from app.models.models import UserSettings
from app.schemas.settings import SettingsInput, SettingsOut


class SettingsService:
    @staticmethod
    def get_settings(db: Session) -> SettingsOut:
        settings = db.get(UserSettings, "default")
        if not settings:
            return SettingsOut(id="default", weight_kg=None, baseline_calories=2000.0)
        return SettingsOut(
            id=settings.id,
            weight_kg=settings.weight_kg,
            baseline_calories=settings.baseline_calories,
        )

    @staticmethod
    def update_settings(db: Session, data: SettingsInput) -> SettingsOut:
        settings = db.get(UserSettings, "default")
        if not settings:
            settings = UserSettings(
                id="default",
                weight_kg=data.weight_kg,
                baseline_calories=2000.0,
                created_at=datetime.datetime.now(datetime.timezone.utc),
                updated_at=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(settings)
        else:
            settings.weight_kg = data.weight_kg
            settings.updated_at = datetime.datetime.now(datetime.timezone.utc)

        db.commit()
        db.refresh(settings)
        return SettingsOut(
            id=settings.id,
            weight_kg=settings.weight_kg,
            baseline_calories=settings.baseline_calories,
        )
