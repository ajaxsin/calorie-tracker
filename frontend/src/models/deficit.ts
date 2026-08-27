// src/models/deficit.ts
export interface DeficitDayEntry {
  date: string;
  day: number;
  intake: number;
  walking_burn: number;
  burn: number;
  deficit: number;
  cumulative_deficit: number;
  steps: number;
  tracked: boolean;
}

export interface DeficitMonthlyResponse {
  year: number;
  month: number;
  weight_kg?: number | null;
  baseline: number;
  kcal_per_kg: number;
  tracked_days: number;
  total_intake: number;
  total_burn: number;
  net_deficit: number;
  estimated_weight_change_kg: number;
  days: DeficitDayEntry[];
}
