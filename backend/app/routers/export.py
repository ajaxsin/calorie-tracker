# app/routers/export.py
from typing import Any, Dict
from fastapi import APIRouter, Depends, File, Query, UploadFile
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.services.export import ExportService

router = APIRouter(tags=["export"])


@router.get("/export/meals.csv")
def export_meals_csv(
    start: str = Query(..., description="Start date YYYY-MM-DD"),
    end: str = Query(..., description="End date YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    return ExportService.export_meals_csv(db, start, end)


@router.post("/export/import-csv")
async def import_meals_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    return await ExportService.import_meals_csv(db, file)


@router.post("/export/import.csv")
async def import_meals_csv_alt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    return await ExportService.import_meals_csv(db, file)
