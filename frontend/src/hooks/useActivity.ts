// src/hooks/useActivity.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activityService } from "@/services/activity";
import { queryKeys } from "@/lib/queryKeys";
import { ActivityInput } from "@/models/activity";

export function useActivity(date: string) {
  return useQuery({
    queryKey: queryKeys.activity.byDate(date),
    queryFn: () => activityService.getActivity(date),
    enabled: !!date,
  });
}

export function useUpdateActivity(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ActivityInput) => activityService.updateActivity(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.activity.byDate(date) });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["deficit"] });
    },
  });
}
