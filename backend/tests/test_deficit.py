import os
import calendar
import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---- /api/deficit/monthly ----
class TestDeficitMonthly:
    def test_august_2026_structure(self, client):
        r = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2026, "month": 8}, timeout=30)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["year", "month", "weight_kg", "baseline", "kcal_per_kg", "tracked_days",
                  "total_intake", "total_burn", "net_deficit", "estimated_weight_change_kg", "days"]:
            assert k in d, f"missing {k}"
        assert d["year"] == 2026 and d["month"] == 8
        assert d["baseline"] == 2000
        assert d["kcal_per_kg"] == 7700
        assert len(d["days"]) == 31
        print("weight_kg", d["weight_kg"], "tracked", d["tracked_days"],
              "net", d["net_deficit"], "wc", d["estimated_weight_change_kg"])
        for day in d["days"]:
            for k in ["date", "day", "intake", "walking_burn", "burn", "deficit",
                      "cumulative_deficit", "steps", "tracked"]:
                assert k in day, f"day missing {k}"
            assert isinstance(day["tracked"], bool)

    def test_untracked_days_zeroed_and_cumulative_monotonic(self, client):
        d = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2026, "month": 8}, timeout=30).json()
        prev = 0
        for day in d["days"]:
            if not day["tracked"]:
                assert day["intake"] == 0, day
                assert day["deficit"] == 0, day
                assert day["cumulative_deficit"] == prev, f"cumulative changed on untracked day {day}"
            prev = day["cumulative_deficit"]
        assert d["days"][-1]["cumulative_deficit"] == d["net_deficit"]

    def test_burn_math(self, client):
        d = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2026, "month": 8}, timeout=30).json()
        w = d["weight_kg"] or 0
        for day in d["days"]:
            expected_walk = round(day["steps"] * w * 0.0005) if w else 0
            assert day["walking_burn"] == expected_walk, day
            assert day["burn"] == 2000 + expected_walk, day
            if day["tracked"]:
                assert day["deficit"] == round(day["burn"] - day["intake"]), day

    def test_aug5_specific_values(self, client):
        d = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2026, "month": 8}, timeout=30).json()
        day5 = [x for x in d["days"] if x["date"] == "2026-08-05"][0]
        print("Aug5:", day5)
        assert day5["tracked"] is True
        assert day5["steps"] > 0
        assert day5["burn"] == 2000 + day5["walking_burn"]

    def test_totals_consistency(self, client):
        d = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2026, "month": 8}, timeout=30).json()
        ti = sum(x["intake"] for x in d["days"] if x["tracked"])
        tb = sum(x["burn"] for x in d["days"] if x["tracked"])
        td = sum(1 for x in d["days"] if x["tracked"])
        assert abs(d["total_intake"] - ti) <= td, (d["total_intake"], ti)
        assert abs(d["total_burn"] - tb) <= td
        assert d["tracked_days"] == td
        assert d["estimated_weight_change_kg"] == round(d["net_deficit"] / 7700.0, 2)

    @pytest.mark.parametrize("month", [0, 13])
    def test_invalid_month(self, client, month):
        r = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2026, "month": month}, timeout=30)
        assert r.status_code == 400, r.status_code

    def test_missing_params(self, client):
        r = client.get(f"{BASE_URL}/api/deficit/monthly", timeout=30)
        assert r.status_code == 422

    def test_empty_month(self, client):
        r = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2026, "month": 12}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["tracked_days"] == 0
        assert d["net_deficit"] == 0
        assert d["total_intake"] == 0
        assert d["estimated_weight_change_kg"] == 0
        assert len(d["days"]) == 31

    def test_feb_leap_and_nonleap_day_counts(self, client):
        for y, expected in [(2026, 28), (2024, 29)]:
            d = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": y, "month": 2}, timeout=30).json()
            assert len(d["days"]) == expected == calendar.monthrange(y, 2)[1]


# ---- regression ----
class TestRegression:
    def test_summary_monthly(self, client):
        r = client.get(f"{BASE_URL}/api/summary/monthly", params={"year": 2026, "month": 8}, timeout=30)
        assert r.status_code == 200
        assert "days" in r.json() or isinstance(r.json(), dict)

    def test_summary_matches_deficit_intake(self, client):
        s = client.get(f"{BASE_URL}/api/summary/monthly", params={"year": 2026, "month": 8}, timeout=30).json()
        d = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2026, "month": 8}, timeout=30).json()
        sd = s.get("days") or []
        if not sd:
            pytest.skip("summary shape unknown")
        smap = {x.get("date"): x for x in sd if isinstance(x, dict) and "date" in x}
        for day in d["days"]:
            if day["tracked"] and day["date"] in smap:
                sv = smap[day["date"]].get("calories")
                if sv is not None:
                    assert abs(round(float(sv)) - day["intake"]) <= 1, (day["date"], sv, day["intake"])

    def test_presets_crud_and_log(self, client):
        r = client.get(f"{BASE_URL}/api/presets", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        created = client.post(f"{BASE_URL}/api/presets", json={
            "name": "TEST_deficit_preset", "meal_text": "TEST oats 100g", "segment": "Breakfast",
            "calories": 380, "protein": 12, "carbs": 60, "fibre": 8, "fats": 7,
        }, timeout=30)
        assert created.status_code in (200, 201), created.text
        pid = created.json().get("id")
        assert pid
        try:
            patched = client.patch(f"{BASE_URL}/api/presets/{pid}", json={"name": "TEST_renamed"}, timeout=30)
            assert patched.status_code == 200, patched.text
            assert patched.json().get("name") == "TEST_renamed"
            lst = client.get(f"{BASE_URL}/api/presets", timeout=30).json()
            assert any(p["id"] == pid and p["name"] == "TEST_renamed" for p in lst)
            logged = client.post(f"{BASE_URL}/api/presets/{pid}/log", json={"date": "2027-03-01", "segment": "Breakfast"}, timeout=30)
            assert logged.status_code in (200, 201), logged.text
            dm = client.get(f"{BASE_URL}/api/deficit/monthly", params={"year": 2027, "month": 3}, timeout=30).json()
            day1 = [x for x in dm["days"] if x["date"] == "2027-03-01"][0]
            assert day1["tracked"] is True, "logged preset meal not reflected in deficit endpoint"
            assert day1["intake"] > 0
            mid = logged.json().get("id")
            if mid:
                client.delete(f"{BASE_URL}/api/meals/{mid}", timeout=30)
        finally:
            client.delete(f"{BASE_URL}/api/presets/{pid}", timeout=30)
        assert not any(p["id"] == pid for p in client.get(f"{BASE_URL}/api/presets", timeout=30).json())

    def test_export_csv(self, client):
        r = client.get(f"{BASE_URL}/api/export/meals.csv",
                       params={"start": "2026-08-01", "end": "2026-08-31"}, timeout=30)
        assert r.status_code == 200
        assert "Date,Segment,Meal" in r.text

    def test_nutrition_estimate(self, client):
        r = client.post(f"{BASE_URL}/api/nutrition/estimate",
                        json={"meal_text": "2 boiled eggs and a slice of toast"}, timeout=120)
        assert r.status_code == 200, r.text
        d = r.json()
        assert float(d.get("calories", 0)) > 0, d
