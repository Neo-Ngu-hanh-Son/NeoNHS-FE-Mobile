import { apiClient, endpoints } from '@/services/api';
import { MapPoint } from '../types';

export default async function getPointOfAttraction(attractionId: string) {
  return await apiClient.get<MapPoint[]>(endpoints.map.getPointsOfAttraction(attractionId), {
    requiresAuth: false,
  });
}
