// src/constants/segments.ts
export const MEAL_SEGMENTS = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;
export type MealSegment = typeof MEAL_SEGMENTS[number];
