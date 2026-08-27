# backend/tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.dependencies.db import get_db
from app.main import app

# Create in-memory SQLite for fast testing
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


class TestHealth:
    def test_root(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json() == {"message": "NutriPaste API"}


class TestMeals:
    def test_create_get_delete_meal(self, client):
        # Create meal
        payload = {
            "meal_text": "2 boiled eggs and 1 slice toast",
            "segment": "Breakfast",
            "date": "2026-08-25",
            "calories": 250,
            "protein": 14,
            "carbs": 15,
            "fibre": 2,
            "fats": 10,
            "confidence": 0.9,
        }
        res = client.post("/meals", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["meal_text"] == payload["meal_text"]
        assert data["segment"] == "Breakfast"
        meal_id = data["id"]

        # Get meals by date
        get_res = client.get("/meals", params={"date": "2026-08-25"})
        assert get_res.status_code == 200
        meals = get_res.json()
        assert len(meals) == 1
        assert meals[0]["id"] == meal_id

        # Delete meal
        del_res = client.delete(f"/meals/{meal_id}")
        assert del_res.status_code == 200
        assert del_res.json() == {"deleted": True}

        # Verify deletion
        get_res2 = client.get("/meals", params={"date": "2026-08-25"})
        assert len(get_res2.json()) == 0


class TestPresets:
    def test_presets_crud_and_log(self, client):
        payload = {
            "name": "Quick Oats",
            "meal_text": "50g oats with milk",
            "calories": 300,
            "protein": 12,
            "carbs": 45,
            "fibre": 5,
            "fats": 6,
        }
        # Create
        res = client.post("/presets", json=payload)
        assert res.status_code == 200
        preset = res.json()
        preset_id = preset["id"]
        assert preset["name"] == "Quick Oats"
        assert preset["use_count"] == 0

        # List
        list_res = client.get("/presets")
        assert list_res.status_code == 200
        assert len(list_res.json()) >= 1

        # Rename
        rename_res = client.patch(f"/presets/{preset_id}", json={"name": "Overnight Oats"})
        assert rename_res.status_code == 200
        assert rename_res.json()["name"] == "Overnight Oats"

        # Log preset
        log_res = client.post(f"/presets/{preset_id}/log", json={"date": "2026-08-26", "segment": "Breakfast"})
        assert log_res.status_code == 200
        meal = log_res.json()
        assert meal["meal_text"] == payload["meal_text"]
        assert meal["segment"] == "Breakfast"

        # Check use_count incremented
        list_res2 = client.get("/presets")
        assert list_res2.json()[0]["use_count"] == 1

        # Delete preset
        del_res = client.delete(f"/presets/{preset_id}")
        assert del_res.status_code == 200


class TestSettingsAndActivity:
    def test_settings_roundtrip(self, client):
        res = client.get("/settings")
        assert res.status_code == 200
        assert res.json()["id"] == "default"

        update_res = client.put("/settings", json={"weight_kg": 75.5})
        assert update_res.status_code == 200
        assert update_res.json()["weight_kg"] == 75.5

        get_res2 = client.get("/settings")
        assert get_res2.json()["weight_kg"] == 75.5

    def test_activity_roundtrip(self, client):
        res = client.put("/activity", json={"date": "2026-08-25", "steps": 8500})
        assert res.status_code == 200
        assert res.json()["steps"] == 8500

        get_res = client.get("/activity", params={"date": "2026-08-25"})
        assert get_res.status_code == 200
        assert get_res.json()["steps"] == 8500


class TestSummaryAndDeficit:
    def test_monthly_summary_and_deficit(self, client):
        # Add a meal and activity
        client.put("/settings", json={"weight_kg": 70.0})
        client.put("/activity", json={"date": "2026-08-10", "steps": 10000})
        client.post("/meals", json={
            "meal_text": "Chicken & Rice",
            "segment": "Lunch",
            "date": "2026-08-10",
            "calories": 600,
            "protein": 45,
            "carbs": 60,
            "fibre": 4,
            "fats": 10,
        })

        # Test summary
        summary_res = client.get("/summary/monthly", params={"year": 2026, "month": 8})
        assert summary_res.status_code == 200
        summary_data = summary_res.json()
        assert summary_data["year"] == 2026
        assert len(summary_data["days"]) == 31
        day10 = next(d for d in summary_data["days"] if d["date"] == "2026-08-10")
        assert day10["calories"] == 600
        assert len(day10["segments"]["Lunch"]) == 1

        # Test deficit
        deficit_res = client.get("/deficit/monthly", params={"year": 2026, "month": 8})
        assert deficit_res.status_code == 200
        deficit_data = deficit_res.json()
        assert deficit_data["tracked_days"] == 1
        assert deficit_data["total_intake"] == 600
        assert deficit_data["weight_kg"] == 70.0


class TestExport:
    def test_export_csv(self, client):
        client.post("/meals", json={
            "meal_text": "Salad",
            "segment": "Dinner",
            "date": "2026-08-15",
            "calories": 200,
            "protein": 5,
            "carbs": 10,
            "fibre": 4,
            "fats": 5,
        })
        res = client.get("/export/meals.csv", params={"start": "2026-08-01", "end": "2026-08-31"})
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        assert "Salad" in res.text

    def test_import_csv(self, client):
        csv_data = (
            "Date,Segment,Meal,Calories,Protein (g),Carbs (g),Fibre (g),Fats (g),Steps\n"
            "2026-08-05,Breakfast,3 Whole Eggs + 2 Toast,425,25.7,19.2,3.6,20.4,12310\n"
            "2026-08-05,Lunch,Chicken Curry + Curd,700,52.1,55.8,5.6,38.2,12310\n"
        )
        files = {"file": ("test_meals.csv", csv_data, "text/csv")}
        res = client.post("/export/import-csv", files=files)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["imported_meals"] == 2
        assert data["imported_days"] == 1

        # Check that meals were inserted
        meals_res = client.get("/meals", params={"date": "2026-08-05"})
        assert meals_res.status_code == 200
        assert len(meals_res.json()) == 2

        # Check that steps were inserted
        act_res = client.get("/activity", params={"date": "2026-08-05"})
        assert act_res.status_code == 200
        assert act_res.json()["steps"] == 12310

