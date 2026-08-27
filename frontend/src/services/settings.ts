// src/services/settings.ts
import api from "@/lib/axios";
import { SettingsInput, UserSettings } from "@/models/settings";

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const { data } = await api.get<UserSettings>("/settings");
    return data;
  },

  async updateSettings(input: SettingsInput): Promise<UserSettings> {
    const { data } = await api.put<UserSettings>("/settings", input);
    return data;
  },
};
