"""AJX90 preset nickname (name) + PATCH rename tests."""
import os

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
API = f"{base_url.rstrip('/')}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def created():
    return {"presets": [], "meals": []}


@pytest.fixture(scope="module", autouse=True)
def cleanup(client, created):
    yield
    for pid in created["presets"]:
        client.delete(f"{API}/presets/{pid}", timeout=30)
    for mid in created["meals"]:
        client.delete(f"{API}/meals/{mid}", timeout=30)


BASE_PAYLOAD = {
    "name": "TEST_Post-workout combo",
    "meal_text": "TEST_chicken + chana + salad",
    "calories": 470, "protein": 52, "carbs": 45, "fibre": 11, "fats": 9,
}


# --- POST /api/presets with name ---
class TestCreatePresetWithName:
    def test_create_with_name_and_persist(self, client, created):
        r = client.post(f"{API}/presets", json=BASE_PAYLOAD, timeout=30)
        assert r.status_code == 200, r.text
        p = r.json()
        assert "_id" not in p
        assert p["name"] == BASE_PAYLOAD["name"]
        assert p["meal_text"] == BASE_PAYLOAD["meal_text"]
        assert p["calories"] == 470 and p["protein"] == 52
        pid = p["id"]
        created["presets"].append(pid)

        # GET verifies persistence
        lst = client.get(f"{API}/presets", timeout=30)
        assert lst.status_code == 200
        stored = next(x for x in lst.json() if x["id"] == pid)
        assert stored["name"] == BASE_PAYLOAD["name"]

    def test_create_without_name_stores_null(self, client, created):
        payload = {k: v for k, v in BASE_PAYLOAD.items() if k != "name"}
        payload["meal_text"] = "TEST_no nickname preset"
        r = client.post(f"{API}/presets", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        p = r.json()
        assert p.get("name") is None
        created["presets"].append(p["id"])

    def test_create_name_too_long_rejected_or_accepted(self, client, created):
        payload = dict(BASE_PAYLOAD)
        payload["name"] = "T" * 61
        r = client.post(f"{API}/presets", json=payload, timeout=30)
        if r.status_code == 200:
            created["presets"].append(r.json()["id"])
            pytest.fail("PresetCreate.name has no max_length=60 validation; 61-char name accepted")
        assert r.status_code == 422


# --- PATCH /api/presets/{id} ---
class TestRenamePreset:
    @pytest.fixture(scope="class")
    def preset_id(self, client, created):
        payload = dict(BASE_PAYLOAD)
        payload["meal_text"] = "TEST_rename target meal"
        r = client.post(f"{API}/presets", json=payload, timeout=30)
        assert r.status_code == 200, r.text
        pid = r.json()["id"]
        created["presets"].append(pid)
        return pid

    def test_rename_sets_name(self, client, preset_id):
        r = client.patch(f"{API}/presets/{preset_id}", json={"name": "TEST_Chicken bowl"}, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json() == {"id": preset_id, "name": "TEST_Chicken bowl"}
        stored = next(x for x in client.get(f"{API}/presets", timeout=30).json() if x["id"] == preset_id)
        assert stored["name"] == "TEST_Chicken bowl"

    def test_rename_trims_whitespace(self, client, preset_id):
        r = client.patch(f"{API}/presets/{preset_id}", json={"name": "   TEST_Trimmed  "}, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["name"] == "TEST_Trimmed"

    def test_empty_string_clears_name(self, client, preset_id):
        r = client.patch(f"{API}/presets/{preset_id}", json={"name": ""}, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["name"] is None
        stored = next(x for x in client.get(f"{API}/presets", timeout=30).json() if x["id"] == preset_id)
        assert stored["name"] is None

    def test_null_clears_name(self, client, preset_id):
        client.patch(f"{API}/presets/{preset_id}", json={"name": "TEST_Temp"}, timeout=30)
        r = client.patch(f"{API}/presets/{preset_id}", json={"name": None}, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["name"] is None
        stored = next(x for x in client.get(f"{API}/presets", timeout=30).json() if x["id"] == preset_id)
        assert stored["name"] is None

    def test_empty_body_clears_name(self, client, preset_id):
        client.patch(f"{API}/presets/{preset_id}", json={"name": "TEST_Temp2"}, timeout=30)
        r = client.patch(f"{API}/presets/{preset_id}", json={}, timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["name"] is None

    def test_name_too_long_rejected(self, client, preset_id):
        r = client.patch(f"{API}/presets/{preset_id}", json={"name": "T" * 61}, timeout=30)
        assert r.status_code == 422, r.text

    def test_rename_preserves_macros(self, client, preset_id):
        client.patch(f"{API}/presets/{preset_id}", json={"name": "TEST_Keeps macros"}, timeout=30)
        stored = next(x for x in client.get(f"{API}/presets", timeout=30).json() if x["id"] == preset_id)
        assert stored["calories"] == 470 and stored["fibre"] == 11
        assert stored["meal_text"] == "TEST_rename target meal"

    def test_rename_unknown_id_404(self, client):
        r = client.patch(f"{API}/presets/does-not-exist-xyz", json={"name": "TEST_x"}, timeout=30)
        assert r.status_code == 404, r.text

    def test_rename_invalid_type(self, client, preset_id):
        r = client.patch(f"{API}/presets/{preset_id}", json={"name": 123}, timeout=30)
        assert r.status_code == 422, r.text


# --- regression: named preset log + delete ---
class TestNamedPresetRegression:
    def test_log_and_delete_named_preset(self, client, created):
        payload = dict(BASE_PAYLOAD)
        payload["name"] = "TEST_Log me"
        payload["meal_text"] = "TEST_log flow meal"
        pid = client.post(f"{API}/presets", json=payload, timeout=30).json()["id"]
        created["presets"].append(pid)

        log = client.post(f"{API}/presets/{pid}/log", json={"date": "2026-08-26", "segment": "Dinner"}, timeout=30)
        assert log.status_code == 200, log.text
        meal = log.json()
        created["meals"].append(meal["id"])
        assert meal["meal_text"] == "TEST_log flow meal"
        assert meal["segment"] == "Dinner" and meal["calories"] == 470
        assert "name" not in meal  # nickname is preset-only metadata

        meals = client.get(f"{API}/meals", params={"date": "2026-08-26"}, timeout=30).json()
        assert any(m["id"] == meal["id"] for m in meals)

        assert client.delete(f"{API}/presets/{pid}", timeout=30).status_code == 200
        created["presets"].remove(pid)
        assert client.delete(f"{API}/presets/{pid}", timeout=30).status_code == 404
        assert client.patch(f"{API}/presets/{pid}", json={"name": "TEST_gone"}, timeout=30).status_code == 404

    def test_monthly_and_csv_still_work(self, client):
        m = client.get(f"{API}/summary/monthly", params={"year": 2026, "month": 8}, timeout=60)
        assert m.status_code == 200, m.text
        assert len(m.json()["days"]) == 31

        c = client.get(f"{API}/export/meals.csv", params={"start": "2026-08-05", "end": "2026-08-10"}, timeout=60)
        assert c.status_code == 200, c.text
        assert "text/csv" in c.headers.get("content-type", "")
        assert c.text.strip().splitlines()[0] == "Date,Segment,Meal,Calories,Protein (g),Carbs (g),Fibre (g),Fats (g),Steps"
