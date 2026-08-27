// src/lib/queryKeys.ts
export const queryKeys = {
  meals: {
    byDate: (date: string) => ["meals", date] as const,
  },
  presets: {
    all: ["presets"] as const,
  },
  activity: {
    byDate: (date: string) => ["activity", date] as const,
  },
  settings: {
    current: ["settings"] as const,
  },
  deficit: {
    monthly: (year: number, month: number) => ["deficit", year, month] as const,
  },
  summary: {
    monthly: (year: number, month: number) => ["summary", year, month] as const,
  },
};
