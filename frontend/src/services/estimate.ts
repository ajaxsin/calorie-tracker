// src/services/estimate.ts
import api from "@/lib/axios";
import { EstimateRequest, EstimateResponse } from "@/models/estimate";

export const estimateService = {
  async estimateNutrition(input: EstimateRequest): Promise<EstimateResponse> {
    const { data } = await api.post<EstimateResponse>("/nutrition/estimate", input);
    return data;
  },
};
