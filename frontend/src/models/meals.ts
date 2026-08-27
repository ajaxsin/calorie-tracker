// src/models/meals.ts
export type MealSegmentType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

export interface Meal {
  id: string;
  meal_text: string;
  segment: MealSegmentType;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fibre: number;
  fats: number;
  confidence?: number | null;
  created_at: string;
}

export interface MealCreateInput {
  meal_text: string;
  segment: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fibre: number;
  fats: number;
  confidence?: number | null;
}
