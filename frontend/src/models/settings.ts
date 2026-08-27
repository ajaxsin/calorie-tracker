// src/models/settings.ts
export interface UserSettings {
  id: string;
  weight_kg?: number | null;
  baseline_calories: number;
}

export interface SettingsInput {
  weight_kg: number;
}
