import { logger } from '@/utils/logger';
import { MultipartCheckinImage, UploadImagePayload, UploadImageResponse } from '../types';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const getFirstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return undefined;
};

const normalizeUploadImageResponse = (payload: unknown): UploadImageResponse => {
  const obj = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;

  const mediaUrl = getFirstString(obj.mediaUrl, obj.imageUrl, obj.url, obj.secureUrl, obj.secure_url, obj.fileUrl);

  if (!mediaUrl) {
    throw new Error('Upload completed but no image URL was returned by the server.');
  }

  const publicId = getFirstString(obj.publicId, obj.public_id, obj.assetId, obj.asset_id, obj.id) ?? '';

  return {
    mediaUrl,
    publicId,
  };
};

const uploadImageService = async (image: MultipartCheckinImage, token: string) => {
  const formData = new FormData();
  formData.append('imageFile', {
    uri: image.uri,
    name: image.name,
    type: image.type,
  } as any);
  try {
    const response = await fetch(`${API_URL}/public/upload/image`, {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    const normalizedPayload = (
      result && typeof result === 'object' && 'data' in result ? (result as { data?: unknown }).data : result
    ) as unknown;

    return normalizeUploadImageResponse(normalizedPayload);
  } catch (err) {
    logger.error('Error uploading image:', err);
    throw err;
  }
};

const useUploadImage = () => {
  return useMutation<UploadImageResponse, Error, UploadImagePayload>({
    mutationFn: (payload: UploadImagePayload) => {
      return uploadImageService(payload.image, payload.token);
    },
    gcTime: 0,
    onError: (error) => logger.error('[uploadImageService] TanStackQuery POST failed:', error),
  });
};

const useDeleteImage = () => {
  return useMutation<string, Error, string>({
    mutationFn: async (publicId: string) => {
      const response = await apiClient.delete<string>(`/public/upload/image/${publicId}`, {
        requiresAuth: true,
      });
      return response.data;
    },
    // We don't need to cache the "deleted" state
    gcTime: 0,
  });
};

const imageService = {
  uploadImage: uploadImageService,
  useUploadImage,
  useDeleteImage,
};
export default imageService;
