import { apiClient, endpoints } from '@/services/api';
import { Attraction, MapPoint } from '../types';
import { PageResponse } from '@/features/event/types';

export async function getPointOfAttraction(attractionId: string) {
  return await apiClient.get<MapPoint[]>(endpoints.map.getPointsOfAttraction(attractionId), {
    requiresAuth: false,
  });
}

export async function getAllDestinations(params: { search?: string, limit?: number, page?: number } = {}) {
  const queryParams: Record<string, string | number> = {};
  if (params.search) queryParams.search = params.search;
  if (params.limit) queryParams.limit = params.limit;
  if (params.page) queryParams.page = params.page;

  return await apiClient.get<Attraction[]>(endpoints.discover.getAllAttractions(), {
    requiresAuth: false,
    params: queryParams
  });
}