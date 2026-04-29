import { useMutation } from "@tanstack/react-query";
import { UploadImagePayload, UploadImageResponse } from "@/services/api/types";
import { logger } from "@/utils/logger";
import imageService from "@/services/api/common/uploadImageService";
import { apiClient } from "@/services/api";

export const useUploadImage = () => {
  return useMutation<UploadImageResponse, Error, UploadImagePayload>({
    mutationFn: (payload: UploadImagePayload) => {
      return imageService.uploadImage(payload.image, payload.token);
    },
    gcTime: 0,
    onError: (error) => logger.error('[uploadImageService] TanStackQuery POST failed:', error),
  });
};

export const useDeleteImage = () => {
  return useMutation<string, Error, string>({
    mutationFn: async (publicId: string) => {
      const response = await apiClient.delete<string>(`/public/upload/image/${publicId}`, {
        requiresAuth: true,
      });
      return response.data;
    },
    gcTime: 0,
  });
};