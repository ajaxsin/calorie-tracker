"""Tests for the confidence string -> float coercion fix (iteration 8)."""
import os
from datetime import date

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
TODAY = date.today().isoformat()


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def created(client):
    ids = {"meals": [], "presets": []}
    yield ids
    for mid in ids["meals"]:
        client.delete(f"{BASE_URL}/api/meals/{mid}", timeout=30)
    for pid in ids["presets"]:
        client.delete(f"{BASE_URL}/api/presets/{pid}", timeout=30)


def meal_payload(conf):
    return {
        "meal_text": "TEST_confidence 2 eggs + 1 toast",
        "segment": "Breakfast",
        "date": TODAY,
        "calories": 250,
        "protein": 15,
        "carbs": 20,
        "fibre": 2,
        "fats": 10,
        "confidence": conf,
    }


# --- POST /api/meals confidence coercion ---
@pytest.mark.parametrize("raw,expected", [
    ("medium", 0.6),
    ("low", 0.3),
    ("high", 0.85),
    ("very high", 0.95),
    ("moderate", 0.6),
    ("unsure", 0.5),
    ("0.75", 0.75),
    (None, None),
    (0.42, 0.42),
])
def test_create_meal_confidence_coercion(client, created, raw, expected):
    r = client.post(f"{BASE_URL}/api/meals", json=meal_payload(raw), timeout=60)
    assert r.status_code == 200, f"{raw} -> {r.status_code} {r.text[:300]}"
    body = r.json()
    created["meals"].append(body["id"])
    assert body["confidence"] == expected
    if expected is not None:
        assert isinstance(body["confidence"], float)
    # verify persistence
    g = client.get(f"{BASE_URL}/api/meals", params={"date": TODAY}, timeout=30)
    assert g.status_code == 200
    stored = [m for m in g.json() if m["id"] == body["id"]]
    assert stored, "meal not persisted"
    assert stored[0]["confidence"] == expected


def test_create_meal_invalid_segment(client):
    p = meal_payload("medium")
    p["segment"] = "Brunch"
    r = client.post(f"{BASE_URL}/api/meals", json=p, timeout=30)
    assert r.status_code == 400


# --- POST /api/presets confidence coercion ---
def test_create_preset_confidence_string(client, created):
    payload = {
        "name": "TEST_preset_conf",
        "meal_text": "TEST_confidence preset meal",
        "calories": 300, "protein": 20, "carbs": 25, "fibre": 3, "fats": 11,
        "confidence": "high",
    }
    r = client.post(f"{BASE_URL}/api/presets", json=payload, timeout=60)
    assert r.status_code == 200, r.text[:300]
    body = r.json()
    created["presets"].append(body["id"])
    assert body["confidence"] == 0.85
    assert isinstance(body["confidence"], float)
    lst = client.get(f"{BASE_URL}/api/presets", timeout=30).json()
    stored = [p for p in lst if p["id"] == body["id"]]
    assert stored and stored[0]["confidence"] == 0.85


def test_preset_rename_and_log(client, created):
    payload = {
        "name": "TEST_preset_log",
        "meal_text": "TEST_confidence log preset",
        "calories": 111, "protein": 9, "carbs": 8, "fibre": 1, "fats": 4,
        "confidence": "medium",
    }
    r = client.post(f"{BASE_URL}/api/presets", json=payload, timeout=60)
    assert r.status_code == 200
    pid = r.json()["id"]
    created["presets"].append(pid)

    rn = client.patch(f"{BASE_URL}/api/presets/{pid}", json={"name": "TEST_renamed"}, timeout=30)
    assert rn.status_code == 200 and rn.json()["name"] == "TEST_renamed"

    lg = client.post(f"{BASE_URL}/api/presets/{pid}/log", json={"date": TODAY, "segment": "Snacks"}, timeout=30)
    assert lg.status_code == 200, lg.text[:300]
    meal = lg.json()
    created["meals"].append(meal["id"])
    assert meal["calories"] == 111 and meal["confidence"] == 0.6
    assert "_id" not in meal


# --- GET/POST nutrition estimate returns float confidence ---
def test_nutrition_estimate_confidence_is_numeric(client):
    r = client.post(f"{BASE_URL}/api/nutrition/estimate",
                    json={"meal_text": "2 eggs + 1 toast"}, timeout=180)
    assert r.status_code == 200, r.text[:400]
    data = r.json()
    for k in ["calories", "protein", "carbs", "fibre", "fats"]:
        assert isinstance(data[k], (int, float)), f"{k} not numeric: {data.get(k)}"
        assert data[k] >= 0
    assert data["calories"] > 0
    conf = data.get("confidence")
    assert conf is None or isinstance(conf, (int, float)), f"confidence not numeric: {conf!r}"


def test_estimate_then_save_roundtrip(client, created):
    est = client.post(f"{BASE_URL}/api/nutrition/estimate",
                      json={"meal_text": "140 Gram Boneless Air Fried Chicken + 100 Grams Boiled Black Chana + 7 Gram Peanuts + Onion/Tomato/Cucumber Salad"},
                      timeout=180)
    assert est.status_code == 200, est.text[:400]
    e = est.json()
    payload = {**e, "meal_text": "TEST_confidence " + "140g chicken + chana + peanuts + salad",
               "segment": "Lunch", "date": TODAY}
    payload.pop("note", None)
    payload.pop("breakdown", None)
    r = client.post(f"{BASE_URL}/api/meals", json=payload, timeout=60)
    assert r.status_code == 200, r.text[:400]
    body = r.json()
    created["meals"].append(body["id"])
    assert body["calories"] > 0 and body["protein"] > 0


# --- Regression: other endpoints ---
def test_summary_monthly(client):
    d = date.today()
    r = client.get(f"{BASE_URL}/api/summary/monthly", params={"year": d.year, "month": d.month}, timeout=60)
    assert r.status_code == 200
    body = r.json()
    assert body["year"] == d.year and len(body["days"]) >= 28


def test_deficit_monthly(client):
    d = date.today()
    r = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": d.year, "month": d.month}, timeout=60)
    assert r.status_code == 200
    body = r.json()
    assert "net_deficit" in body and isinstance(body["days"], list)
    r2 = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": d.year, "month": 13}, timeout=30)
    assert r2.status_code == 400


def test_export_csv(client):
    r = client.get(f"{BASE_URL}/api/export/meals.csv",
                   params={"start": f"{date.today().year}-01-01", "end": TODAY}, timeout=60)
    assert r.status_code == 200
    assert "Date,Segment,Meal" in r.text.splitlines()[0]


def test_settings_and_activity(client):
    s = client.get(f"{BASE_URL}/api/settings", timeout=30)
    assert s.status_code == 200
    a = client.get(f"{BASE_URL}/api/activity", params={"date": TODAY}, timeout=30)
    assert a.status_code == 200 and "steps" in a.json()


def test_delete_meal_404(client):
    r = client.delete(f"{BASE_URL}/api/meals/does-not-exist", timeout=30)
    assert r.status_code == 404
