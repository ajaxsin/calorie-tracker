// src/hooks/useMonthlySummary.ts
import { useQuery } from "@tanstack/react-query";
import { summaryService } from "@/services/summary";
import { queryKeys } from "@/lib/queryKeys";

export function useMonthlySummary(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.summary.monthly(year, month),
    queryFn: () => summaryService.getMonthlySummary(year, month),
    enabled: !!year && !!month,
  });
}
