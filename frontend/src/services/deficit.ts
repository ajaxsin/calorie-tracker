// src/services/deficit.ts
import api from "@/lib/axios";
import { DeficitMonthlyResponse } from "@/models/deficit";

export const deficitService = {
  async getMonthlyDeficit(year: number, month: number): Promise<DeficitMonthlyResponse> {
    const { data } = await api.get<DeficitMonthlyResponse>("/deficit/monthly", {
      params: { year, month },
    });
    return data;
  },
};
