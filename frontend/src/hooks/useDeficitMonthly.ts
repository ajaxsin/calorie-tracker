// src/hooks/useDeficitMonthly.ts
import { useQuery } from "@tanstack/react-query";
import { deficitService } from "@/services/deficit";
import { queryKeys } from "@/lib/queryKeys";

export function useDeficitMonthly(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.deficit.monthly(year, month),
    queryFn: () => deficitService.getMonthlyDeficit(year, month),
    enabled: !!year && !!month,
  });
}
