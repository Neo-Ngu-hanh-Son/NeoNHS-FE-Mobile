import { apiClient, endpoints } from '@/services/api';
import { Attraction, MapPoint, MapPointCheckin } from '../types';
import { PageResponse } from '@/services/api/types';

export const mapService = {
  getPointOfAttraction: async (attractionId: string) => {
    return await apiClient.get<MapPoint[]>(endpoints.map.getPointsOfAttraction(attractionId), {
      requiresAuth: false,
    });
  },

  getAllDestinations: async (params: { search?: string; limit?: number; page?: number } = {}) => {
    const queryParams: Record<string, string | number> = {};
    if (params.search) queryParams.search = params.search;
    if (params.limit) queryParams.limit = params.limit;
    if (params.page) queryParams.page = params.page;

    return await apiClient.get<Attraction[]>(endpoints.discover.getAllAttractions(), {
      requiresAuth: false,
      params: queryParams,
    });
  },

  getCheckinPointsByPointId: async (
    pointId: string,
    params: {
      search?: string;
      size?: number;
      page?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    } = {}
  ) => {
    const queryParams: Record<string, string | number> = {};
    if (params.search) queryParams.search = params.search;
    if (params.size) queryParams.size = params.size;
    if (params.page) queryParams.page = params.page;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDir) queryParams.sortDir = params.sortDir;

    const response = await apiClient.get<PageResponse<MapPointCheckin>>(
      endpoints.map.getCheckinPointsByPointId(pointId),
      {
        requiresAuth: false,
        params: queryParams,
      }
    );

    return {
      ...response,
      data: {
        ...response.data,
        content: response.data.content.map((item) => ({
          ...item,
          type: item.type ?? 'CHECKIN',
        })),
      },
    };
  },

  getCheckinPointById: async (pointId: string, checkinId: string) => {
    return await apiClient.get<MapPointCheckin>(
      endpoints.map.getCheckinPointById(pointId, checkinId),
      {
        requiresAuth: false,
      }
    );
  },

  getMapPoints: async () => {
    return await apiClient.get<MapPoint[]>(endpoints.map.getMapPoints(), {
      requiresAuth: false,
    });
  },
};

