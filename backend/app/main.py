# app/main.py
from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.db.database import Base, engine
import app.models  # Register all models for metadata creation

from app.routers.activity import router as activity_router
from app.routers.deficit import router as deficit_router
from app.routers.estimate import router as estimate_router
from app.routers.export import router as export_router
from app.routers.meals import router as meals_router
from app.routers.presets import router as presets_router
from app.routers.settings import router as settings_router
from app.routers.status import router as status_router
from app.routers.summary import router as summary_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        logger.info("Initializing database schema...")
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.warning(f"Database schema initialization deferred or skipped: {e}")
    yield
    logger.info("Shutting down Calorie Tracker API.")


app = FastAPI(
    title="NutriPaste Calorie Tracker API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    root_path="/api",
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi

origins = [
    origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(meals_router)
app.include_router(presets_router)
app.include_router(activity_router)
app.include_router(settings_router)
app.include_router(estimate_router)
app.include_router(deficit_router)
app.include_router(summary_router)
app.include_router(export_router)
app.include_router(status_router)


@app.get("/")
def root():
    return {"message": "NutriPaste API"}
