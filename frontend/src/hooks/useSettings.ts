// src/hooks/useSettings.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings";
import { queryKeys } from "@/lib/queryKeys";
import { SettingsInput } from "@/models/settings";

export function useSettings() {
  return useQuery({
    queryKey: queryKeys.settings.current,
    queryFn: settingsService.getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SettingsInput) => settingsService.updateSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.current });
      queryClient.invalidateQueries({ queryKey: ["deficit"] });
    },
  });
}
