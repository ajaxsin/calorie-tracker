// src/services/export.ts
import api from "@/lib/axios";

export interface ImportCsvResponse {
  success: boolean;
  imported_meals: number;
  imported_days: number;
  message: string;
}

export const exportService = {
  getExportCsvUrl(start: string, end: string): string {
    const baseUrl = api.defaults.baseURL || "/api";
    return `${baseUrl.replace(/\/$/, "")}/export/meals.csv?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  },

  async importMealsCsv(file: File): Promise<ImportCsvResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<ImportCsvResponse>("/export/import-csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
