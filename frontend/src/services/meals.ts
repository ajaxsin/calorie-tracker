// src/services/meals.ts
import api from "@/lib/axios";
import { Meal, MealCreateInput } from "@/models/meals";

export const mealService = {
  async getMealsByDate(date: string): Promise<Meal[]> {
    const { data } = await api.get<Meal[]>("/meals", {
      params: { date },
    });
    return data;
  },

  async createMeal(input: MealCreateInput): Promise<Meal> {
    const { data } = await api.post<Meal>("/meals", input);
    return data;
  },

  async deleteMeal(id: string): Promise<{ deleted: boolean }> {
    const { data } = await api.delete<{ deleted: boolean }>(`/meals/${id}`);
    return data;
  },
};
