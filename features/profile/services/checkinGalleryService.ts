import { apiClient } from '@/services/api/client';
import { endpoints } from '@/services/api/endpoints/endpoints';
import type { ApiResponse } from '@/services/api/types';
import type { CheckinGalleryImage, UserCheckinGalleryResponse } from '@/features/profile/types';

export const checkinGalleryService = {
  async getMyCheckinGallery(): Promise<ApiResponse<CheckinGalleryImage[]>> {
    const response = await apiClient.get<UserCheckinGalleryResponse | CheckinGalleryImage[]>(
      endpoints.users.getMyCheckinGallery(),
      {
        requiresAuth: true,
      }
    );

    const normalizedItems = Array.isArray(response.data)
      ? response.data
      : (response.data?.items ?? []);

    return {
      ...response,
      data: normalizedItems,
    };
  },
};
