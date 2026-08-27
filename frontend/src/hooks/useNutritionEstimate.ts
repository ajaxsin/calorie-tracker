// src/hooks/useNutritionEstimate.ts
import { useMutation } from "@tanstack/react-query";
import { estimateService } from "@/services/estimate";
import { EstimateRequest } from "@/models/estimate";

export function useNutritionEstimate() {
  return useMutation({
    mutationFn: (input: EstimateRequest) => estimateService.estimateNutrition(input),
  });
}
