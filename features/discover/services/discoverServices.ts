import { apiClient, endpoints, ApiResponse } from "@/services/api";
import { Attraction, MapPoint } from "../../map/types";

export const discoverService = {
    getAllAttractions: async (): Promise<ApiResponse<Attraction[]>> => {
        return await apiClient.get<Attraction[]>(endpoints.discover.getAllAttractions());
    },

    getAttractionById: async (id: string | number): Promise<ApiResponse<Attraction>> => {
        return await apiClient.get<Attraction>(endpoints.discover.getAttractionById(id));
    },

    getPointsByAttraction: async (attractionId: string | number): Promise<ApiResponse<MapPoint[]>> => {
        return await apiClient.get<MapPoint[]>(endpoints.discover.getPointsOfAttraction(attractionId));
    },

    getPointById: async (id: string | number): Promise<ApiResponse<MapPoint>> => {
        return await apiClient.get<MapPoint>(endpoints.discover.getPointById(id));
    },
};

export default discoverService;
