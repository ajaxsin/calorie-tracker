# app/models/enums.py
import enum


class MealSegment(str, enum.Enum):
    BREAKFAST = "Breakfast"
    LUNCH = "Lunch"
    DINNER = "Dinner"
    SNACKS = "Snacks"
