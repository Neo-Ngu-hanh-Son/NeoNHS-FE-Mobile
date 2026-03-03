import { apiClient } from '@/services/api';
import { mapEndpoints } from '@/services/api/endpoints/map.api';
import { PointPanoramaResponse } from '../types';
import { logger } from '@/utils/logger';

export const panoramaService = {
  getPointPanorama: async (pointId: string) => {
    const response = await apiClient.get<PointPanoramaResponse>(mapEndpoints.getPanorama(pointId));
    return response.data;
  },

  getCheckinPointPanorama: async (pointId: string) => {
    const response = await apiClient.get<PointPanoramaResponse>(
      mapEndpoints.getCheckinPanorama(pointId)
    );
    return response.data;
  },
};
