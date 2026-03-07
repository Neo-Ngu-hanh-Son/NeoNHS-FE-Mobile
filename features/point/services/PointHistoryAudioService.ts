import { apiClient, ApiResponse } from '@/services/api';
import { discoverEndpoints } from '@/services/api/endpoints/discover.api';
import { PointHistoryAudioResponse } from '../types';

export async function getPointHistoryAudiosOfPointId(
  pointId: string
): Promise<ApiResponse<PointHistoryAudioResponse[]>> {
  return apiClient.get<PointHistoryAudioResponse[]>(
    discoverEndpoints.getAllHistoryAudiosOfPoint(pointId),
    {
      requiresAuth: false,
    }
  );
}
