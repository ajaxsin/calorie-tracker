// src/services/activity.ts
import api from "@/lib/axios";
import { Activity, ActivityInput } from "@/models/activity";

export const activityService = {
  async getActivity(date: string): Promise<Activity> {
    const { data } = await api.get<Activity>("/activity", {
      params: { date },
    });
    return data;
  },

  async updateActivity(input: ActivityInput): Promise<Activity> {
    const { data } = await api.put<Activity>("/activity", input);
    return data;
  },
};
