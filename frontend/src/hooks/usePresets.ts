// src/hooks/usePresets.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { presetService } from "@/services/presets";
import { queryKeys } from "@/lib/queryKeys";
import { PresetCreateInput, PresetLogInput, PresetRenameInput } from "@/models/presets";

export function usePresets() {
  return useQuery({
    queryKey: queryKeys.presets.all,
    queryFn: presetService.listPresets,
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PresetCreateInput) => presetService.createPreset(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
    },
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => presetService.deletePreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
    },
  });
}

export function useRenamePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PresetRenameInput }) =>
      presetService.renamePreset(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
    },
  });
}

export function useLogPreset(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PresetLogInput }) =>
      presetService.logPreset(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.byDate(date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.presets.all });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["deficit"] });
    },
  });
}
