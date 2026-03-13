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

  getPanoramaFrontEndUrl: () => {
    const FE_URL = process.env.EXPO_PUBLIC_FE_URL;
    console.log('FE_URL', FE_URL);
    if (!FE_URL) {
      logger.error('[panoramaService] FE_URL is not defined in environment variables');
      return null;
    }
    return `${FE_URL}/${mapEndpoints.getMobilePointPanorama()}`;
  }
};
