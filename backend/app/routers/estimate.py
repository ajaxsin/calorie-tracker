# app/routers/estimate.py
from fastapi import APIRouter
from app.schemas.estimate import EstimateRequest, EstimateResponse
from app.services.estimate import EstimateService

router = APIRouter(tags=["nutrition"])


@router.post("/nutrition/estimate", response_model=EstimateResponse)
async def estimate_nutrition(payload: EstimateRequest):
    return await EstimateService.estimate_nutrition(payload)
