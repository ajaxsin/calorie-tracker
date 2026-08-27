# app/schemas/__init__.py
from .activity import ActivityInput, ActivityOut
from .deficit import DeficitDayEntry, DeficitMonthlyResponse
from .estimate import BreakdownItem, EstimateRequest, EstimateResponse
from .meals import MealCreate, MealOut
from .presets import PresetCreate, PresetLog, PresetOut, PresetRename
from .settings import SettingsInput, SettingsOut
from .status import StatusCheckCreate, StatusCheckOut
from .summary import DaySummary, MonthlySummaryResponse, SegmentMealItem

__all__ = [
    "ActivityInput",
    "ActivityOut",
    "DeficitDayEntry",
    "DeficitMonthlyResponse",
    "BreakdownItem",
    "EstimateRequest",
    "EstimateResponse",
    "MealCreate",
    "MealOut",
    "PresetCreate",
    "PresetLog",
    "PresetOut",
    "PresetRename",
    "SettingsInput",
    "SettingsOut",
    "StatusCheckCreate",
    "StatusCheckOut",
    "DaySummary",
    "MonthlySummaryResponse",
    "SegmentMealItem",
]
