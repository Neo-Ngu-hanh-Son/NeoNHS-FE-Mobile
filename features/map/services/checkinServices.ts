import { apiClient, ApiResponse, endpoints } from '@/services/api';
import { MapPointCheckin, UserCheckinRequest, UserCheckinResultResponse, mapConstants } from '../types';
import { parseFloatOrDefault } from '@/utils/parseNumber';

type MultipartCheckinImage = {
  uri: string;
  name: string;
  type: string;
};

const checkinServices = {
  uploadCheckinImage: async (image: MultipartCheckinImage) => {
    const formData = new FormData();
    formData.append('imageFile', image as unknown as Blob);

    return await apiClient.post<string>(endpoints.utilities.uploadImage(), formData, {
      requiresAuth: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
    metersRadius?: number
  ): Promise<ApiResponse<MapPointCheckin[]>> => {
    if (!metersRadius) {
      metersRadius = mapConstants.fetchingCheckinParameters;
    }
    const queryParams: Record<string, number> = { latitude: lat, longitude: lng, metersRadius };
    const result = await apiClient.get<MapPointCheckin[]>(endpoints.map.getNearbyCheckIns(), {
      requiresAuth: true,
      params: queryParams,
    });
    // Parse all the lat and lng values to numbers to ensure consistency
    result.data = result.data.map((checkin) => ({
      ...checkin,
      latitude: parseFloatOrDefault(checkin.latitude as unknown as string, 0),
      longitude: parseFloatOrDefault(checkin.longitude as unknown as string, 0),
    }));
    return result;
  },
};

export default checkinServices;
