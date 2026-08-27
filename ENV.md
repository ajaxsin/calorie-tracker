# Environment Variables Configuration Guide (`ENV.md`)

This document provides a complete guide on configuring environment variables across all services in the **NutriPaste Calorie Tracker** application.

---

## Quick Start Setup

To quickly configure all `.env` files with working defaults:

```bash
# 1. DBMS Environment
cp dbms/.env.example dbms/.env

# 2. Backend Environment
cp backend/.env.example backend/.env

# 3. Frontend Environment
cp frontend/.env.example frontend/.env
```

---

## Service Environment Details

### 1. Database Management Service (`dbms/.env`)

| Variable | Type | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `POSTGRES_DB` | String | PostgreSQL database name | `calorie_tracker` |
| `POSTGRES_USER` | String | Superuser username | `admin` |
| `POSTGRES_PASSWORD` | String | Superuser password | `admin123` |

#### Example `dbms/.env`:
```env
POSTGRES_DB=calorie_tracker
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
```

---

### 2. Backend Service (`backend/.env`)

| Variable | Type | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | String | SQLAlchemy PostgreSQL connection URL | `postgresql://admin:admin123@db:5432/calorie_tracker` (Docker) or `postgresql://admin:admin123@localhost:5432/calorie_tracker` (Local) |
| `SECRET_KEY` | String | Cryptographic secret for signing tokens | `calorie-tracker-secret-key-2026-super-secure` |
| `ALGORITHM` | String | JWT / Hashing algorithm | `HS256` |
| `ALLOWED_ORIGINS` | String | Comma-separated CORS allowed origins | `http://localhost:3000,http://127.0.0.1:3000` |
| `ENVIRONMENT` | String | Environment mode (`development` / `production`) | `development` |
| `APP_VERSION` | String | Current application version | `1.0.0` |
| `GROQ_API_KEY` | String | Your Groq API key | `gsk_...` |
| `GROQ_MODEL` | String | Model to use on Groq | `llama-3.3-70b-versatile` |
| `GROQ_BASE_URL` | String | Groq API Base URL | `https://api.groq.com/openai/v1` |

#### Example `backend/.env`:
```env
DATABASE_URL=postgresql://admin:admin123@db:5432/calorie_tracker
SECRET_KEY=calorie-tracker-secret-key-2026-super-secure-change-in-prod
ALGORITHM=HS256
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ENVIRONMENT=development
APP_VERSION=1.0.0

# Groq AI Configuration
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1
```

---

### 3. Frontend Service (`frontend/.env`)

| Variable | Type | Description | Default / Example |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | String | Public URL of the FastAPI backend endpoint | `http://localhost:8000/api` |
| `NEXT_PUBLIC_APP_VERSION` | String | Frontend client version badge | `1.0.0` |

#### Example `frontend/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## Security Best Practices
- Never commit active `.env` files with production credentials to version control.
- Ensure all `.env` files are ignored by git (already covered in `.gitignore`).
- For production deployments, rotate `SECRET_KEY` and PostgreSQL passwords.
