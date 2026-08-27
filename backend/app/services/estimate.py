# app/services/estimate.py
import json
import logging
import re
from typing import Any, Dict
from fastapi import HTTPException
import httpx

from app.core.config import settings
from app.schemas.estimate import EstimateRequest, EstimateResponse

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You estimate nutrition for one meal and must avoid undercounting.
Parse every ingredient and quantity, account for edible cooked weights, cooking oil, sauces, marinades, nuts, and dressings.
If oil or preparation details are missing, state the assumption and use a realistic standard amount rather than zero.
Cross-check calories against macros (protein*4 + carbs*4 + fibre*2 + fats*9), then choose the more realistic/higher result when uncertain.
Return ONLY valid JSON with keys: calories, protein, carbs, fibre, fats, confidence, note, and breakdown.
breakdown must be an array of objects with keys: item, calories, protein, carbs, fibre, fats.
Use numeric values in kcal and grams."""


def _clean_json_string(raw: str) -> str:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"```$", "", cleaned)
    return cleaned.strip()


def _coerce_confidence(conf_raw: Any) -> float:
    if conf_raw is None:
        return 0.85
    if isinstance(conf_raw, (int, float)):
        return float(conf_raw)
    mapping = {
        "low": 0.3,
        "medium": 0.6,
        "med": 0.6,
        "moderate": 0.6,
        "high": 0.85,
        "very high": 0.95,
    }
    return mapping.get(str(conf_raw).strip().lower(), 0.5)


class EstimateService:
    @staticmethod
    async def estimate_nutrition(data: EstimateRequest) -> EstimateResponse:
        meal_text = data.meal_text.strip()
        if not meal_text:
            return EstimateResponse(
                calories=0.0,
                protein=0.0,
                carbs=0.0,
                fibre=0.0,
                fats=0.0,
                confidence=1.0,
                note="Empty meal description",
                breakdown=[],
            )

        # Groq API Integration
        if settings.GROQ_API_KEY:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(
                        f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions",
                        headers={
                            "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "model": settings.GROQ_MODEL,
                            "messages": [
                                {"role": "system", "content": SYSTEM_PROMPT},
                                {"role": "user", "content": f"Estimate this meal: {meal_text}"},
                            ],
                            "temperature": 0.2,
                            "response_format": {"type": "json_object"},
                        },
                    )
                    resp.raise_for_status()
                    res_json = resp.json()
                    content = res_json["choices"][0]["message"]["content"]
                    parsed = json.loads(_clean_json_string(content))
                    return EstimateService._format_response(parsed)
            except Exception as e:
                logger.warning(f"Groq estimate failed: {e}")

        # Heuristic fallback if no key is configured or on temporary network failure
        return EstimateService._heuristic_fallback(meal_text)

    @staticmethod
    def _format_response(data: Dict[str, Any]) -> EstimateResponse:
        calories = round(float(data.get("calories", 0)))
        protein = round(float(data.get("protein", 0)), 1)
        carbs = round(float(data.get("carbs", 0)), 1)
        fibre = round(float(data.get("fibre", 0)), 1)
        fats = round(float(data.get("fats", 0)), 1)
        confidence = _coerce_confidence(data.get("confidence"))
        note = data.get("note") or "Based on standard nutritional density."
        breakdown = data.get("breakdown") or []

        return EstimateResponse(
            calories=calories,
            protein=protein,
            carbs=carbs,
            fibre=fibre,
            fats=fats,
            confidence=confidence,
            note=note,
            breakdown=breakdown,
        )

    @staticmethod
    def _heuristic_fallback(text: str) -> EstimateResponse:
        lower = text.lower()
        calories = 350.0
        protein = 20.0
        carbs = 35.0
        fibre = 4.0
        fats = 12.0

        if "egg" in lower:
            calories += 140
            protein += 12
            fats += 10
        if "chicken" in lower or "meat" in lower:
            calories += 200
            protein += 30
            fats += 5
        if "rice" in lower or "roti" in lower or "bread" in lower or "toast" in lower:
            calories += 180
            carbs += 38
            fibre += 2
        if "salad" in lower or "veggie" in lower:
            fibre += 4
            calories += 40
        if "whey" in lower or "protein" in lower:
            protein += 24
            calories += 120

        return EstimateResponse(
            calories=round(calories),
            protein=round(protein, 1),
            carbs=round(carbs, 1),
            fibre=round(fibre, 1),
            fats=round(fats, 1),
            confidence=0.75,
            note="Estimated via local baseline nutrition rules.",
            breakdown=[{"item": text, "calories": calories, "protein": protein, "carbs": carbs, "fibre": fibre, "fats": fats}],
        )
