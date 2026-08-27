# app/services/export.py
import csv
import datetime
import io
import uuid
from typing import Any, Dict, List, Optional
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import MealSegment
from app.models.models import DailyActivity, Meal


def _safe_float(v: Any, default: float = 0.0) -> float:
    if v is None:
        return default
    try:
        s = str(v).strip()
        if not s:
            return default
        return float(s)
    except (TypeError, ValueError):
        return default


def _safe_int(v: Any, default: int = 0) -> int:
    if v is None:
        return default
    try:
        s = str(v).strip()
        if not s:
            return default
        return int(float(s))
    except (TypeError, ValueError):
        return default


def _normalize_segment(val: str) -> MealSegment:
    s = (val or "").strip().lower()
    mapping = {
        "breakfast": MealSegment.BREAKFAST,
        "lunch": MealSegment.LUNCH,
        "dinner": MealSegment.DINNER,
        "snacks": MealSegment.SNACKS,
        "snack": MealSegment.SNACKS,
    }
    return mapping.get(s, MealSegment.SNACKS)


class ExportService:
    @staticmethod
    def export_meals_csv(db: Session, start: str, end: str) -> StreamingResponse:
        stmt = (
            select(Meal)
            .where(Meal.date >= start, Meal.date <= end)
            .order_by(Meal.date.asc(), Meal.created_at.asc())
        )
        meals = db.scalars(stmt).all()

        act_stmt = select(DailyActivity).where(DailyActivity.date >= start, DailyActivity.date <= end)
        activities = db.scalars(act_stmt).all()
        steps_by_date = {a.date: a.steps for a in activities}

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(["Date", "Segment", "Meal", "Calories", "Protein (g)", "Carbs (g)", "Fibre (g)", "Fats (g)", "Steps"])

        for m in meals:
            seg = m.segment.value if hasattr(m.segment, "value") else str(m.segment)
            writer.writerow([
                m.date,
                seg,
                m.meal_text,
                round(float(m.calories or 0)),
                round(float(m.protein or 0), 1),
                round(float(m.carbs or 0), 1),
                round(float(m.fibre or 0), 1),
                round(float(m.fats or 0), 1),
                steps_by_date.get(m.date, ""),
            ])

        buffer.seek(0)
        filename = f"ajx90_{start}_to_{end}.csv"
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )

    @staticmethod
    async def import_meals_csv(db: Session, file: UploadFile) -> Dict[str, Any]:
        contents = await file.read()
        try:
            text_data = contents.decode("utf-8-sig")
        except UnicodeDecodeError:
            try:
                text_data = contents.decode("latin-1")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Could not decode CSV file: {e}")

        reader = csv.reader(io.StringIO(text_data))
        rows = list(reader)
        if not rows:
            raise HTTPException(status_code=400, detail="Uploaded CSV file is empty.")

        header = [col.strip().lower() for col in rows[0]]

        # Find column indices
        date_idx = next((i for i, h in enumerate(header) if "date" in h), -1)
        segment_idx = next((i for i, h in enumerate(header) if "segment" in h), -1)
        meal_idx = next((i for i, h in enumerate(header) if "meal" in h or "food" in h or "desc" in h), -1)
        cal_idx = next((i for i, h in enumerate(header) if "calor" in h or "kcal" in h), -1)
        prot_idx = next((i for i, h in enumerate(header) if "prot" in h), -1)
        carbs_idx = next((i for i, h in enumerate(header) if "carb" in h), -1)
        fibre_idx = next((i for i, h in enumerate(header) if "fibr" in h or "fiber" in h), -1)
        fats_idx = next((i for i, h in enumerate(header) if "fat" in h or "lipid" in h), -1)
        steps_idx = next((i for i, h in enumerate(header) if "step" in h), -1)

        if date_idx == -1 or meal_idx == -1:
            raise HTTPException(
                status_code=400,
                detail="CSV must contain at least 'Date' and 'Meal' columns.",
            )

        imported_meals = 0
        dates_seen = set()
        activity_steps_map: Dict[str, int] = {}

        now = datetime.datetime.now(datetime.timezone.utc)

        for row_num, row in enumerate(rows[1:], start=2):
            if not row or not any(field.strip() for field in row):
                continue

            date_val = row[date_idx].strip() if date_idx < len(row) else ""
            if not date_val:
                continue

            meal_text = row[meal_idx].strip() if meal_idx < len(row) else ""
            if not meal_text:
                continue

            segment_raw = row[segment_idx].strip() if segment_idx >= 0 and segment_idx < len(row) else "Snacks"
            segment_enum = _normalize_segment(segment_raw)

            calories = _safe_float(row[cal_idx]) if cal_idx >= 0 and cal_idx < len(row) else 0.0
            protein = _safe_float(row[prot_idx]) if prot_idx >= 0 and prot_idx < len(row) else 0.0
            carbs = _safe_float(row[carbs_idx]) if carbs_idx >= 0 and carbs_idx < len(row) else 0.0
            fibre = _safe_float(row[fibre_idx]) if fibre_idx >= 0 and fibre_idx < len(row) else 0.0
            fats = _safe_float(row[fats_idx]) if fats_idx >= 0 and fats_idx < len(row) else 0.0

            meal = Meal(
                id=str(uuid.uuid4()),
                meal_text=meal_text,
                segment=segment_enum,
                date=date_val,
                calories=calories,
                protein=protein,
                carbs=carbs,
                fibre=fibre,
                fats=fats,
                confidence=0.85,
                created_at=now,
                updated_at=now,
            )
            db.add(meal)
            imported_meals += 1
            dates_seen.add(date_val)

            # Check steps
            if steps_idx >= 0 and steps_idx < len(row):
                steps_raw = row[steps_idx].strip()
                if steps_raw:
                    steps_int = _safe_int(steps_raw)
                    if steps_int > 0:
                        activity_steps_map[date_val] = steps_int

        # Upsert activity records
        for d, steps in activity_steps_map.items():
            act_stmt = select(DailyActivity).where(DailyActivity.date == d)
            act = db.scalar(act_stmt)
            if not act:
                act = DailyActivity(
                    date=d,
                    steps=steps,
                    created_at=now,
                    updated_at=now,
                )
                db.add(act)
            else:
                if steps > act.steps or act.steps == 0:
                    act.steps = steps
                    act.updated_at = now

        db.commit()

        return {
            "success": True,
            "imported_meals": imported_meals,
            "imported_days": len(dates_seen),
            "message": f"Successfully imported {imported_meals} meal{'s' if imported_meals != 1 else ''} across {len(dates_seen)} day{'s' if len(dates_seen) != 1 else ''}.",
        }
