# app/routers/__init__.py
from .activity import router as activity_router
from .deficit import router as deficit_router
from .estimate import router as estimate_router
from .export import router as export_router
from .meals import router as meals_router
from .presets import router as presets_router
from .settings import router as settings_router
from .status import router as status_router
from .summary import router as summary_router

__all__ = [
    "activity_router",
    "deficit_router",
    "estimate_router",
    "export_router",
    "meals_router",
    "presets_router",
    "settings_router",
    "status_router",
    "summary_router",
]
