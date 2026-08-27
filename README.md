# NutriPaste Calorie Tracker


A full-stack nutrition tracking and deficit analysis system built with **FastAPI**, **PostgreSQL**, and **Next.js (App Router)**.

## Project Structure

```
calorie-tracker/
├── dbms/                  # PostgreSQL DDL, migrations, seed data & compose
│   ├── init.sql
│   ├── sample-data.sql
│   ├── docker-compose.yml
│   ├── .env
│   └── README.md
├── backend/               # FastAPI modular backend (SQLAlchemy 2.0 + PostgreSQL)
│   ├── app/
│   │   ├── core/          # App configuration
│   │   ├── db/            # Database session & engine
│   │   ├── dependencies/  # FastAPI dependency injection
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic validation schemas
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic & computations
│   │   └── main.py        # App entrypoint
│   ├── tests/             # Pytest test suite
│   ├── Dockerfile
│   ├── start.sh
│   ├── requirements.txt
│   └── .env
├── frontend/              # Next.js App Router (TypeScript + Tailwind CSS)
│   ├── src/
│   │   ├── app/           # App Router pages (Dashboard, History, Deficit)
│   │   ├── components/    # Layout, dashboard, history & deficit components
│   │   ├── hooks/         # React Query custom hooks
│   │   ├── lib/           # Axios instance & utility functions
│   │   ├── models/        # TypeScript interfaces
│   │   └── services/      # API communication services
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   └── .env
├── docker-compose.yml     # Multi-container root orchestrator
├── ENV.md                 # Complete guide to environment variables
└── README.md              # Project overview
```

## Running with Docker Compose

1. Set up `.env` files across services (refer to [`ENV.md`](./ENV.md)):
```bash
cp dbms/.env.example dbms/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Start the full application:
```bash
docker compose up -d --build
```

3. Access the services:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **pgAdmin**: [http://localhost:5050](http://localhost:5050)
- **PostgreSQL**: `localhost:5432`

## Local Development

### 1. Database
```bash
cd dbms && docker compose up -d
```

### 2. Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Running Tests
```bash
cd backend && pytest tests/ -v
```
