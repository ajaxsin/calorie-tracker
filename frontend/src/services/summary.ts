// src/services/summary.ts
import api from "@/lib/axios";
import { MonthlySummaryResponse } from "@/models/summary";

export const summaryService = {
  async getMonthlySummary(year: number, month: number): Promise<MonthlySummaryResponse> {
    const { data } = await api.get<MonthlySummaryResponse>("/summary/monthly", {
      params: { year, month },
    });
    return data;
  },
};
