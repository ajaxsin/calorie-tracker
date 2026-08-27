// src/models/presets.ts
export interface Preset {
  id: string;
  name?: string | null;
  meal_text: string;
  calories: number;
  protein: number;
  carbs: number;
  fibre: number;
  fats: number;
  confidence?: number | null;
  use_count: number;
  created_at: string;
}

export interface PresetCreateInput {
  name?: string | null;
  meal_text: string;
  calories: number;
  protein: number;
  carbs: number;
  fibre: number;
  fats: number;
  confidence?: number | null;
}

export interface PresetRenameInput {
  name?: string | null;
}

export interface PresetLogInput {
  date: string;
  segment: string;
}
