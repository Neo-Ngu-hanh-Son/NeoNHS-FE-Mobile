import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints/endpoints';
import type { ApiResponse } from '@/services/api/types';
import type { CheckinGalleryImage, UserCheckinGalleryResponse } from '@/features/profile/types';

export const checkinGalleryService = {
  async getMyCheckinGallery(params?: { checkinPointId?: string }): Promise<ApiResponse<CheckinGalleryImage[]>> {
    const requestParams = {
      ...(params?.checkinPointId ? { checkinPointId: params.checkinPointId } : {}),
    };

    const response = await apiClient.get<UserCheckinGalleryResponse | CheckinGalleryImage[]>(
      endpoints.users.getMyCheckinGallery(),
      {
        requiresAuth: true,
        params: requestParams,
      }
    );

    const normalizedItems = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);

    return {
      ...response,
      data: normalizedItems,
    };
  },
};
