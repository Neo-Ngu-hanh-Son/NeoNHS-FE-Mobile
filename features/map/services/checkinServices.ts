import { apiClient, ApiResponse, endpoints } from '@/services/api';
import { MapPointCheckin, UserCheckinRequest, UserCheckinResultResponse } from '../types';
import { mapConstants } from '../mapConstants';

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
    return await apiClient.get(endpoints.map.getNearbyCheckIns(), {
      requiresAuth: true,
      params: queryParams,
    });
  },
};

export default checkinServices;
