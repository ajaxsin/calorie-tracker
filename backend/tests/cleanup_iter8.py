"""Delete TEST_ prefixed meals/presets created during iteration 8 E2E."""
import os
from datetime import date, timedelta

import requests
from dotenv import dotenv_values

BASE = (os.environ.get("REACT_APP_BACKEND_URL") or dotenv_values("/app/frontend/.env")["REACT_APP_BACKEND_URL"]).rstrip("/")

removed = 0
for i in range(0, 4):
    d = (date.today() - timedelta(days=i)).isoformat()
    meals = requests.get(f"{BASE}/api/meals", params={"date": d}, timeout=30).json()
    for m in meals:
        if m.get("meal_text", "").startswith("TEST_"):
            requests.delete(f"{BASE}/api/meals/{m['id']}", timeout=30)
            removed += 1
presets = requests.get(f"{BASE}/api/presets", timeout=30).json()
for p in presets:
    if (p.get("meal_text") or "").startswith("TEST_") or (p.get("name") or "").startswith("TEST_"):
        requests.delete(f"{BASE}/api/presets/{p['id']}", timeout=30)
        removed += 1
print(f"removed {removed}")
for i in range(0, 2):
    d = (date.today() - timedelta(days=i)).isoformat()
    print(d, [m["meal_text"][:40] for m in requests.get(f"{BASE}/api/meals", params={"date": d}, timeout=30).json()])
print("presets:", [(p.get("name"), p["meal_text"][:30]) for p in requests.get(f"{BASE}/api/presets", timeout=30).json()])
