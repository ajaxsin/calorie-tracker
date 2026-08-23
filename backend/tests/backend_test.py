import os

import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


def test_api_root():
    response = requests.get(f"{BASE_URL}/api/", timeout=30)
    assert response.status_code == 200
    assert response.json()["message"] == "NutriPaste API"


def test_meal_create_read_delete():
    meal = {"meal_text": "TEST_100g chicken and salad", "segment": "Lunch", "date": "2099-01-01", "calories": 250, "protein": 30, "carbs": 10, "fibre": 4, "fats": 8, "confidence": 0.9}
    created = requests.post(f"{BASE_URL}/api/meals", json=meal, timeout=30)
    assert created.status_code == 200
    payload = created.json()
    assert payload["meal_text"] == meal["meal_text"]
    assert isinstance(payload["id"], str)
    try:
        listed = requests.get(f"{BASE_URL}/api/meals", params={"date": meal["date"]}, timeout=30)
        assert listed.status_code == 200
        assert any(item["id"] == payload["id"] for item in listed.json())
    finally:
        deleted = requests.delete(f"{BASE_URL}/api/meals/{payload['id']}", timeout=30)
        assert deleted.status_code == 200
        assert deleted.json()["deleted"] is True


def test_invalid_segment_rejected():
    response = requests.post(f"{BASE_URL}/api/meals", json={"meal_text": "TEST_invalid", "segment": "Brunch", "date": "2099-01-01", "calories": 1, "protein": 1, "carbs": 1, "fibre": 1, "fats": 1}, timeout=30)
    assert response.status_code == 400


def test_settings_and_activity_persist():
    settings = requests.put(f"{BASE_URL}/api/settings", json={"weight_kg": 70}, timeout=30)
    assert settings.status_code == 200
    assert settings.json()["weight_kg"] == 70
    saved_settings = requests.get(f"{BASE_URL}/api/settings", timeout=30)
    assert saved_settings.status_code == 200
    assert saved_settings.json()["weight_kg"] == 70

    activity = requests.put(f"{BASE_URL}/api/activity", json={"date": "2099-01-02", "steps": 10000}, timeout=30)
    assert activity.status_code == 200
    assert activity.json() == {"date": "2099-01-02", "steps": 10000}
    saved_activity = requests.get(f"{BASE_URL}/api/activity", params={"date": "2099-01-02"}, timeout=30)
    assert saved_activity.status_code == 200
    assert saved_activity.json()["steps"] == 10000


@pytest.mark.integration
def test_nutrition_estimate_shape():
    response = requests.post(f"{BASE_URL}/api/nutrition/estimate", json={"meal_text": "140 gram boneless air fried chicken with salad"}, timeout=120)
    assert response.status_code == 200
    payload = response.json()
    for key in ("calories", "protein", "carbs", "fibre", "fats", "note"):
        assert key in payload
    for key in ("calories", "protein", "carbs", "fibre", "fats"):
        assert isinstance(payload[key], (int, float))