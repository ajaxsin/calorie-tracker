"""Import the 5 missing historical meals from the Apple Numbers source."""
import asyncio, os, json, uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import httpx

load_dotenv('/app/backend/.env')
API_BASE = "http://localhost:8001/api"

MISSING = [
    ("2026-08-05", "Lunch",     "2 Roti + 200 Grams Chicken Curry + 150 Grams Curd", 700),
    ("2026-08-05", "Snacks",    "1 Coke Zero + 1 Scoop Superyou Yeast Protein + 1.3 Grams Black Coffee", 125),
    ("2026-08-09", "Lunch",     "2.5 Plain Roti + Palak Paneer Sabzi with 100 Grams Paneer", 680),
    ("2026-08-10", "Dinner",    "180 Grams Boneless Air Fried Chicken with 1 TSP Mustard Oil + 150 Grams Green Moong Salad + 0.5 Roti + 0.5 Katori Curd", 700),
    ("2026-08-19", "Lunch",     "2 Plain Roti + Paneer Sabzi with 90 Grm Paneer + 1 Katori Amul Curd", 650),
]

def safe_float(v, default=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default

async def estimate(client, meal_text):
    r = await client.post(f"{API_BASE}/nutrition/estimate", json={"meal_text": meal_text}, timeout=120)
    r.raise_for_status()
    return r.json()

async def main():
    async with httpx.AsyncClient() as client:
        for date, segment, text, cals_src in MISSING:
            print(f"[{date} {segment}] estimating...")
            try:
                est = await estimate(client, text)
            except Exception as e:
                print(f"  estimate FAILED: {e}. Using zeros.")
                est = {"calories": cals_src, "protein": 0, "carbs": 0, "fibre": 0, "fats": 0, "confidence": 0.5, "note": "auto-imported without macros"}
            payload = {
                "meal_text": text,
                "segment": segment,
                "date": date,
                # keep user's tracked calories, use AI macros
                "calories": safe_float(cals_src, safe_float(est.get("calories"), 0)),
                "protein":  safe_float(est.get("protein"), 0),
                "carbs":    safe_float(est.get("carbs"), 0),
                "fibre":    safe_float(est.get("fibre"), 0),
                "fats":     safe_float(est.get("fats"), 0),
                "confidence": safe_float(est.get("confidence"), 0.5),
            }
            r = await client.post(f"{API_BASE}/meals", json=payload, timeout=30)
            if r.status_code >= 300:
                print(f"  INSERT FAILED {r.status_code}: {r.text}")
            else:
                print(f"  OK -> {r.json()['id']} (cals={payload['calories']}, P={payload['protein']} C={payload['carbs']} F={payload['fibre']} Fat={payload['fats']})")

asyncio.run(main())
