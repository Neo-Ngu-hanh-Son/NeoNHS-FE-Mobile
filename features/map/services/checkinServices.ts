import { apiClient, ApiResponse, endpoints } from "@/services/api";
import { MapPointCheckin } from "../types";
import { mapConstants } from "../mapConstants";
import { UserCheckinRequest } from "@/features/map/types";

const checkinServices = {
  checkIn: async (pointId: string, payload?: { imageUrl?: string }) => {
    return await apiClient.post(endpoints.map.checkIn(pointId), payload);
  },

  userCheckIn: async (payload: UserCheckinRequest) => {
    return await apiClient.post(endpoints.map.userCheckIn(), payload, {
      requiresAuth: true,
    });
  },

  getNearbyCheckIns: async (lat: number, lng: number, metersRadius?: number):
    Promise<ApiResponse<MapPointCheckin[]>> => {
    if (!metersRadius) {
      metersRadius = mapConstants.fetchingCheckinParameters;
    }
    const queryParams: Record<string, number> = { latitude: lat, longitude: lng, metersRadius };
    return await apiClient.get(endpoints.map.getNearbyCheckIns(), {
      requiresAuth: false,
      params: queryParams,
    });
  },

};

export default checkinServices;