# DBMS - Calorie Tracker Database

This directory contains the PostgreSQL schema DDL, sample seed data, and Docker configuration for running the database service.

## Schema Overview
- **`meal_segment`**: Enum (`Breakfast`, `Lunch`, `Dinner`, `Snacks`)
- **`user_settings`**: Stores user profile parameters (e.g., `weight_kg`, `baseline_calories`).
- **`daily_activities`**: Daily step counts indexed by `date` (`YYYY-MM-DD`).
- **`meals`**: Logged meals with calories, protein, carbs, fibre, fats, confidence, and timestamps.
- **`presets`**: Saved meal templates with macros, optional nicknames, and usage frequency counters.
- **`status_checks`**: System health monitoring logs.

## Environment Configuration
Create a `.env` file in this directory with the following variables:
```env
POSTGRES_DB=calorie_tracker
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
```

## Running the Standalone Database
```bash
docker compose up -d
```
The database will be accessible at `localhost:5432` and pgAdmin at `http://localhost:5050`.
