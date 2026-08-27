# app/services/summary.py
from calendar import monthrange
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.models import DailyActivity, Meal
from app.schemas.summary import DaySummary, MonthlySummaryResponse, SegmentMealItem


class SummaryService:
    @staticmethod
    def calculate_monthly_summary(db: Session, year: int, month: int) -> MonthlySummaryResponse:
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="Invalid month")

        _, days = monthrange(year, month)
        start = f"{year:04d}-{month:02d}-01"
        end = f"{year:04d}-{month:02d}-{days:02d}"

        meals_stmt = (
            select(Meal)
            .where(Meal.date >= start, Meal.date <= end)
            .order_by(Meal.date.asc(), Meal.created_at.asc())
        )
        meals = db.scalars(meals_stmt).all()

        act_stmt = select(DailyActivity).where(DailyActivity.date >= start, DailyActivity.date <= end)
        activities = db.scalars(act_stmt).all()

        steps_by_date = {a.date: int(a.steps or 0) for a in activities}

        by_day = {}
        for d in range(1, days + 1):
            key = f"{year:04d}-{month:02d}-{d:02d}"
            by_day[key] = DaySummary(
                date=key,
                day=d,
                calories=0.0,
                protein=0.0,
                carbs=0.0,
                fibre=0.0,
                fats=0.0,
                steps=steps_by_date.get(key, 0),
                segments={"Breakfast": [], "Lunch": [], "Dinner": [], "Snacks": []},
            )

        for m in meals:
            entry = by_day.get(m.date)
            if not entry:
                continue
            entry.calories += float(m.calories or 0)
            entry.protein += float(m.protein or 0)
            entry.carbs += float(m.carbs or 0)
            entry.fibre += float(m.fibre or 0)
            entry.fats += float(m.fats or 0)

            seg = m.segment.value if hasattr(m.segment, "value") else str(m.segment)
            if seg in entry.segments:
                entry.segments[seg].append(
                    SegmentMealItem(
                        id=m.id,
                        meal_text=m.meal_text,
                        calories=float(m.calories or 0),
                    )
                )

        days_list = [by_day[k] for k in sorted(by_day.keys())]
        return MonthlySummaryResponse(year=year, month=month, days=days_list)
