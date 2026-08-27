# app/services/deficit.py
from calendar import monthrange
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import DailyActivity, Meal, UserSettings
from app.schemas.deficit import DeficitDayEntry, DeficitMonthlyResponse


class DeficitService:
    @staticmethod
    def calculate_monthly_deficit(db: Session, year: int, month: int) -> DeficitMonthlyResponse:
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="Invalid month")

        _, days = monthrange(year, month)
        start = f"{year:04d}-{month:02d}-01"
        end = f"{year:04d}-{month:02d}-{days:02d}"

        settings = db.get(UserSettings, "default")
        weight = float(settings.weight_kg) if settings and settings.weight_kg else 0.0
        baseline = float(settings.baseline_calories) if settings else 2000.0
        kcal_per_kg = 7700.0

        meals_stmt = select(Meal).where(Meal.date >= start, Meal.date <= end)
        meals = db.scalars(meals_stmt).all()

        activity_stmt = select(DailyActivity).where(DailyActivity.date >= start, DailyActivity.date <= end)
        activities = db.scalars(activity_stmt).all()

        steps_by_date = {a.date: int(a.steps or 0) for a in activities}
        intake_by_date: dict = {}
        for m in meals:
            intake_by_date[m.date] = intake_by_date.get(m.date, 0.0) + float(m.calories or 0)

        entries = []
        cumulative = 0.0
        total_intake = 0.0
        total_burn = 0.0
        tracked_days = 0

        for d in range(1, days + 1):
            key = f"{year:04d}-{month:02d}-{d:02d}"
            steps = steps_by_date.get(key, 0)
            intake = intake_by_date.get(key, 0.0)
            walking_burn = round(steps * weight * 0.0005) if weight else 0
            burn = baseline + walking_burn
            deficit = burn - intake if intake > 0 else 0
            if intake > 0:
                cumulative += deficit
                total_intake += intake
                total_burn += burn
                tracked_days += 1
            entries.append(
                DeficitDayEntry(
                    date=key,
                    day=d,
                    intake=round(intake),
                    walking_burn=walking_burn,
                    burn=round(burn),
                    deficit=round(deficit),
                    cumulative_deficit=round(cumulative),
                    steps=steps,
                    tracked=intake > 0,
                )
            )

        net_deficit = round(cumulative)
        est_weight_change = round(net_deficit / kcal_per_kg, 2)

        return DeficitMonthlyResponse(
            year=year,
            month=month,
            weight_kg=weight if weight > 0 else None,
            baseline=baseline,
            kcal_per_kg=kcal_per_kg,
            tracked_days=tracked_days,
            total_intake=round(total_intake),
            total_burn=round(total_burn),
            net_deficit=net_deficit,
            estimated_weight_change_kg=est_weight_change,
            days=entries,
        )
