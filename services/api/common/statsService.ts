import { StatsResponse } from "@/types/common";
import { ApiResponse } from "../types";
import { apiClient } from "../client";

export function fetchStats(): Promise<ApiResponse<StatsResponse>> {
  const resp = apiClient.get<StatsResponse>('public/statistics/counts', { requiresAuth: false });
  return resp;
}