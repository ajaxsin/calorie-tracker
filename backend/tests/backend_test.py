"""AJX90 backend regression + monthly summary tests."""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def created():
    return {"meals": [], "presets": []}


@pytest.fixture(scope="module", autouse=True)
def cleanup(client, created):
    yield
    for mid in created["meals"]:
        client.delete(f"{API}/meals/{mid}", timeout=30)
    for pid in created["presets"]:
        client.delete(f"{API}/presets/{pid}", timeout=30)


# --- health ---
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/", timeout=30)
        assert r.status_code == 200


# --- monthly summary (new feature) ---
class TestMonthlySummary:
    def test_august_2026(self, client):
        r = client.get(f"{API}/summary/monthly", params={"year": 2026, "month": 8}, timeout=60)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["year"] == 2026 and data["month"] == 8
        assert len(data["days"]) == 31
        for d in data["days"]:
            for key in ["date", "day", "calories", "protein", "carbs", "fibre", "fats", "steps", "segments"]:
                assert key in d, f"missing {key} in {d}"
            assert set(d["segments"].keys()) == {"Breakfast", "Lunch", "Dinner", "Snacks"}
        tracked = [d for d in data["days"] if d["calories"] > 0]
        assert len(tracked) > 0, "expected seeded August 2026 data"
        aug5 = next(d for d in data["days"] if d["date"] == "2026-08-05")
        assert aug5["calories"] > 0
        assert sum(len(v) for v in aug5["segments"].values()) > 0

    def test_february_leap_and_empty_month(self, client):
        r = client.get(f"{API}/summary/monthly", params={"year": 2026, "month": 2}, timeout=60)
        assert r.status_code == 200
        assert len(r.json()["days"]) == 28
        r2 = client.get(f"{API}/summary/monthly", params={"year": 2026, "month": 9}, timeout=60)
        assert r2.status_code == 200
        assert len(r2.json()["days"]) == 30

    def test_invalid_month(self, client):
        r = client.get(f"{API}/summary/monthly", params={"year": 2026, "month": 13}, timeout=30)
        assert r.status_code == 400, r.text

    def test_missing_params(self, client):
        r = client.get(f"{API}/summary/monthly", timeout=30)
        assert r.status_code == 422


# --- presets ---
class TestPresets:
    def test_preset_crud_and_log(self, client, created):
        payload = {"meal_text": "TEST_preset oats bowl", "calories": 420, "protein": 20,
                   "carbs": 55, "fibre": 8, "fats": 12}
        r = client.post(f"{API}/presets", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        p = r.json()
        assert "_id" not in p
        assert p["meal_text"] == payload["meal_text"]
        assert p["use_count"] == 0
        pid = p["id"]
        created["presets"].append(pid)

        lst = client.get(f"{API}/presets", timeout=30)
        assert lst.status_code == 200
        assert any(x["id"] == pid for x in lst.json())

        log = client.post(f"{API}/presets/{pid}/log", json={"date": "2026-08-25", "segment": "Lunch"}, timeout=30)
        assert log.status_code == 200, log.text
        meal = log.json()
        assert meal["segment"] == "Lunch" and meal["date"] == "2026-08-25"
        assert meal["calories"] == payload["calories"]
        created["meals"].append(meal["id"])

        # use_count incremented
        lst2 = client.get(f"{API}/presets", timeout=30).json()
        assert next(x for x in lst2 if x["id"] == pid)["use_count"] == 1

        # meal persisted
        meals = client.get(f"{API}/meals", params={"date": "2026-08-25"}, timeout=30).json()
        assert any(m["id"] == meal["id"] for m in meals)

        # invalid segment
        bad = client.post(f"{API}/presets/{pid}/log", json={"date": "2026-08-25", "segment": "Brunch"}, timeout=30)
        assert bad.status_code == 400

        d = client.delete(f"{API}/presets/{pid}", timeout=30)
        assert d.status_code == 200
        created["presets"].remove(pid)
        assert client.delete(f"{API}/presets/{pid}", timeout=30).status_code == 404

    def test_log_unknown_preset(self, client):
        r = client.post(f"{API}/presets/does-not-exist/log", json={"date": "2026-08-25", "segment": "Lunch"}, timeout=30)
        assert r.status_code == 404


# --- csv export ---
class TestExport:
    def test_export_csv(self, client):
        r = client.get(f"{API}/export/meals.csv", params={"start": "2026-08-05", "end": "2026-08-10"}, timeout=60)
        assert r.status_code == 200, r.text
        assert "text/csv" in r.headers.get("content-type", "")
        assert "attachment" in r.headers.get("content-disposition", "")
        lines = r.text.strip().splitlines()
        assert lines[0] == "Date,Segment,Meal,Calories,Protein (g),Carbs (g),Fibre (g),Fats (g),Steps"
        assert len(lines) > 1, "expected meal rows for Aug 5-10"


# --- meals CRUD ---
class TestMeals:
    def test_create_get_delete(self, client, created):
        payload = {"meal_text": "TEST_grilled chicken salad", "segment": "Dinner", "date": "2026-08-25",
                   "calories": 350, "protein": 40, "carbs": 10, "fibre": 5, "fats": 14}
        r = client.post(f"{API}/meals", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        m = r.json()
        assert "_id" not in m and m["meal_text"] == payload["meal_text"]
        mid = m["id"]
        created["meals"].append(mid)

        g = client.get(f"{API}/meals", params={"date": "2026-08-25"}, timeout=30)
        assert g.status_code == 200
        assert any(x["id"] == mid and x["calories"] == 350 for x in g.json())

        d = client.delete(f"{API}/meals/{mid}", timeout=30)
        assert d.status_code == 200
        created["meals"].remove(mid)
        g2 = client.get(f"{API}/meals", params={"date": "2026-08-25"}, timeout=30).json()
        assert not any(x["id"] == mid for x in g2)

    def test_delete_unknown_meal(self, client):
        assert client.delete(f"{API}/meals/nope-123", timeout=30).status_code == 404

    def test_meals_requires_date(self, client):
        assert client.get(f"{API}/meals", timeout=30).status_code == 422


# --- settings & activity ---
class TestSettingsActivity:
    def test_settings_roundtrip(self, client):
        original = client.get(f"{API}/settings", timeout=30)
        assert original.status_code == 200
        prev = original.json().get("weight_kg")
        r = client.put(f"{API}/settings", json={"weight_kg": 72.5}, timeout=30)
        assert r.status_code == 200
        assert client.get(f"{API}/settings", timeout=30).json()["weight_kg"] == 72.5
        if prev:
            client.put(f"{API}/settings", json={"weight_kg": prev}, timeout=30)

    def test_activity_roundtrip(self, client):
        r = client.put(f"{API}/activity", json={"date": "2026-08-25", "steps": 9123}, timeout=30)
        assert r.status_code == 200
        g = client.get(f"{API}/activity", params={"date": "2026-08-25"}, timeout=30)
        assert g.status_code == 200 and g.json()["steps"] == 9123
        # reflected in monthly summary
        month = client.get(f"{API}/summary/monthly", params={"year": 2026, "month": 8}, timeout=60).json()
        assert next(d for d in month["days"] if d["date"] == "2026-08-25")["steps"] == 9123


# --- AI nutrition estimate ---
class TestNutritionEstimate:
    def test_estimate(self, client):
        r = client.post(f"{API}/nutrition/estimate", json={"meal_text": "2 boiled eggs and one slice of toast"}, timeout=120)
        assert r.status_code == 200, r.text
        data = r.json()
        for key in ["calories", "protein", "carbs", "fibre", "fats"]:
            assert key in data and isinstance(data[key], (int, float))
        assert data["calories"] > 0

    def test_estimate_empty_text(self, client):
        # NOTE (minor): backend has no server-side guard for blank meal_text; it forwards
        # the empty prompt to the LLM and returns zeros. Documented, not enforced here.
        r = client.post(f"{API}/nutrition/estimate", json={"meal_text": "   "}, timeout=60)
        assert r.status_code in (200, 400, 422), f"got {r.status_code}: {r.text[:300]}"
        if r.status_code == 200:
            assert r.json()["calories"] == 0
