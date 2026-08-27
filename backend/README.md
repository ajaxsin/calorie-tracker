# Backend - NutriPaste Calorie Tracker API

Modular FastAPI backend service powered by PostgreSQL and SQLAlchemy 2.0.

## Project Structure
```
backend/
├── app/
│   ├── core/           # Configuration & environment settings
│   ├── db/             # Database engine & session setup
│   ├── dependencies/   # Dependency injection (e.g. get_db)
│   ├── models/         # SQLAlchemy 2.0 ORM models & enums
│   ├── schemas/        # Pydantic request/response schemas
│   ├── routers/        # API route handlers
│   ├── services/       # Core business logic & computations
│   └── main.py         # FastAPI application entrypoint
├── tests/              # Pytest test suite
├── Dockerfile          # Container definition (no hardcoded env vars)
├── start.sh            # Container startup script
└── requirements.txt    # Python dependencies
```

## Running Locally

1. Create and activate a virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure `.env`:
```bash
cp .env.example .env
```

4. Start the server:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
