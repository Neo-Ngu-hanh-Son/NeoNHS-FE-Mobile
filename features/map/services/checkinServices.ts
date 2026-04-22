import { apiClient, ApiResponse, endpoints, MultipartCheckinImage } from '@/services/api';
import { MapPointCheckin, UserCheckinRequest, UserCheckinResultResponse } from '../types';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import MAP_CONSTANTS from '../constants';
import { logger } from '@/utils/logger';
import imageService from '@/services/api/common/uploadImageService';

const checkinServices = {
  /**
   * Uploads a check-in image to the server and returns the image URL.
   */
  uploadCheckinImage: async (image: MultipartCheckinImage, token: string) => {
    try {
      return await imageService.uploadImage(image, token);
    } catch (error) {
      logger.error('Error uploading check-in image:', error);
      throw error;
    }
  },

  userCheckIn: async (payload: UserCheckinRequest) => {
    return await apiClient.post<UserCheckinResultResponse>(endpoints.map.userCheckIn(), payload, {
      requiresAuth: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  getNearbyCheckIns: async (
    lat: number,
    lng: number,
    metersRadius: number = MAP_CONSTANTS.FETCH_CHECKIN_RADIUS_M
  ): Promise<ApiResponse<MapPointCheckin[]>> => {
    const queryParams: Record<string, number> = { latitude: lat, longitude: lng, metersRadius };
    const result = await apiClient.get<MapPointCheckin[]>(endpoints.map.getNearbyCheckIns(), {
      requiresAuth: true,
      params: queryParams,
    });
    // Parse all the lat and lng values to numbers to ensure consistency+
    result.data = result.data.map((checkin) => ({
      ...checkin,
      latitude: parseFloatOrDefault(checkin.latitude as unknown as string, 0),
      longitude: parseFloatOrDefault(checkin.longitude as unknown as string, 0),
    }));
    return result;
  },
};

export default checkinServices;
