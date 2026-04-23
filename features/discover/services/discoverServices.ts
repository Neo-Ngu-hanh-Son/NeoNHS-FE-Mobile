import { apiClient, endpoints, ApiResponse } from '@/services/api';
import { Attraction, MapPoint } from '../../map/types';
import { PageResponse } from '@/features/event/types';

function buildQueryParams(params?: {
  page: number;
  size: number;
  sortBy: string;
  sortDir: string;
  search: string;
}): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (!params) return q;
  if (params.page !== undefined) q.page = params.page;
  if (params.size !== undefined) q.size = params.size;
  if (params.sortBy) q.sortBy = params.sortBy;
  if (params.sortDir) q.sortDir = params.sortDir;
  q.search = params.search ?? '';
  return q;
}

export const discoverService = {
  getAllAttractions: async (): Promise<ApiResponse<Attraction[]>> => {
    return await apiClient.get<Attraction[]>(endpoints.discover.getAllAttractions());
  },

  getAllAttractionsWithPointPaginated: async (params?: {
    page: number;
    size: number;
    sortBy: string;
    sortDir: string;
    search: string;
  }): Promise<ApiResponse<PageResponse<Attraction>>> => {
    let res = await apiClient.get<PageResponse<Attraction>>(endpoints.discover.getAllAttractionsWithPointPaginated(), {
      params: buildQueryParams(params),
    });
    return res;
  },

  getAttractionById: async (id: string | number): Promise<ApiResponse<Attraction>> => {
    return await apiClient.get<Attraction>(endpoints.discover.getAttractionById(id));
  },

  getPointsByAttraction: async (
    attractionId: string | number
  ): Promise<ApiResponse<MapPoint[]>> => {
    return await apiClient.get<MapPoint[]>(endpoints.discover.getPointsOfAttraction(attractionId));
  },

  getPointById: async (id: string | number): Promise<ApiResponse<MapPoint>> => {
    return await apiClient.get<MapPoint>(endpoints.discover.getPointById(id), {
      requiresAuth: false,
    });
  },

  getAllPoints: async (): Promise<ApiResponse<PageResponse<MapPoint>>> => {
    return await apiClient.get<PageResponse<MapPoint>>(endpoints.discover.getAllAvailablePoints(), {
      requiresAuth: false
    });
  },
};

export default discoverService;
