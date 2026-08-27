// src/models/estimate.ts
export interface NutritionBreakdownItem {
  item: string;
  calories: number;
  protein: number;
  carbs: number;
  fibre: number;
  fats: number;
}

export interface EstimateResponse {
  calories: number;
  protein: number;
  carbs: number;
  fibre: number;
  fats: number;
  confidence?: number;
  note?: string;
  breakdown?: NutritionBreakdownItem[];
}

export interface EstimateRequest {
  meal_text: string;
}
