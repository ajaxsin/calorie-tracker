# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin:admin123@localhost:5432/calorie_tracker"
    SECRET_KEY: str = "calorie-tracker-secret-key-2026-super-secure"
    ALGORITHM: str = "HS256"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,*"
    ENVIRONMENT: str = "development"
    APP_VERSION: str = "1.0.0"
    
    # Groq AI Settings
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"

    model_config = SettingsConfigDict(extra="ignore", env_file=".env")


settings = Settings()
