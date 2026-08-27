// src/hooks/useMeals.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mealService } from "@/services/meals";
import { queryKeys } from "@/lib/queryKeys";
import { MealCreateInput } from "@/models/meals";

export function useMeals(date: string) {
  return useQuery({
    queryKey: queryKeys.meals.byDate(date),
    queryFn: () => mealService.getMealsByDate(date),
    enabled: !!date,
  });
}

export function useCreateMeal(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MealCreateInput) => mealService.createMeal(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.byDate(date) });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["deficit"] });
    },
  });
}

export function useDeleteMeal(date: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mealService.deleteMeal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.meals.byDate(date) });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
      queryClient.invalidateQueries({ queryKey: ["deficit"] });
    },
  });
}
