// src/models/summary.ts
export interface SegmentMealItem {
  id: string;
  meal_text: string;
  calories: number;
}

export interface DaySummary {
  date: string;
  day: number;
  calories: number;
  protein: number;
  carbs: number;
  fibre: number;
  fats: number;
  steps: number;
  segments: {
    Breakfast: SegmentMealItem[];
    Lunch: SegmentMealItem[];
    Dinner: SegmentMealItem[];
    Snacks: SegmentMealItem[];
  };
}

export interface MonthlySummaryResponse {
  year: number;
  month: number;
  days: DaySummary[];
}
