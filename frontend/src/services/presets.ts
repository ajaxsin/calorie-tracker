// src/services/presets.ts
import api from "@/lib/axios";
import { Meal } from "@/models/meals";
import { Preset, PresetCreateInput, PresetLogInput, PresetRenameInput } from "@/models/presets";

export const presetService = {
  async listPresets(): Promise<Preset[]> {
    const { data } = await api.get<Preset[]>("/presets");
    return data;
  },

  async createPreset(input: PresetCreateInput): Promise<Preset> {
    const { data } = await api.post<Preset>("/presets", input);
    return data;
  },

  async deletePreset(id: string): Promise<{ deleted: boolean }> {
    const { data } = await api.delete<{ deleted: boolean }>(`/presets/${id}`);
    return data;
  },

  async renamePreset(id: string, input: PresetRenameInput): Promise<{ id: string; name: string | null }> {
    const { data } = await api.patch<{ id: string; name: string | null }>(`/presets/${id}`, input);
    return data;
  },

  async logPreset(id: string, input: PresetLogInput): Promise<Meal> {
    const { data } = await api.post<Meal>(`/presets/${id}/log`, input);
    return data;
  },
};
