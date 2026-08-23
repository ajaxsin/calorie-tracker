"""Seed/cleanup helper for iteration-7 E2E (preset log date behaviour)."""
import sys
import requests
from dotenv import dotenv_values

BASE = dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"


def seed():
    payload = {"name": "TEST_iter7_preset", "meal_text": "TEST_iter7 2 boiled eggs",
               "calories": 150, "protein": 12, "carbs": 1, "fats": 10,
               "fibre": 0, "confidence": 0.9}
    r = requests.post(f"{BASE}/presets", json=payload, timeout=30)
    r.raise_for_status()
    print(r.json()["id"])


def cleanup():
    for p in requests.get(f"{BASE}/presets", timeout=30).json():
        if str(p.get("name") or "").startswith("TEST_iter7") or "TEST_iter7" in str(p.get("meal_text")):
            print("del preset", requests.delete(f"{BASE}/presets/{p['id']}", timeout=30).status_code)
    import datetime
    for offset in range(0, 3):
        d = (datetime.date.today() - datetime.timedelta(days=offset)).isoformat()
        for m in requests.get(f"{BASE}/meals", params={"date": d}, timeout=30).json():
            if "TEST_iter7" in str(m.get("meal_text")):
                print("del meal", d, requests.delete(f"{BASE}/meals/{m['id']}", timeout=30).status_code)


def counts():
    import datetime
    for offset in range(0, 2):
        d = (datetime.date.today() - datetime.timedelta(days=offset)).isoformat()
        ms = requests.get(f"{BASE}/meals", params={"date": d}, timeout=30).json()
        print(d, len(ms), [(m["segment"], m["meal_text"][:30]) for m in ms])


if __name__ == "__main__":
    {"seed": seed, "cleanup": cleanup, "counts": counts}[sys.argv[1]]()
