// src/hooks/useImportMeals.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exportService, ImportCsvResponse } from "@/services/export";

export function useImportMeals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => exportService.importMealsCsv(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meals"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["deficit"] });
    },
  });
}
