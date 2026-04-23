import { useCallback, useState } from 'react';

import checkinServices from '@/features/map/services/checkinServices';
import { CheckinMethod, UserCheckinRequest } from '@/features/map/types';
import { useUserLocation } from '@/features/map/hooks/useUserLocation';
import { logger } from '@/utils/logger';
import { useCheckinMutation } from './Checkin/useCheckinMutation';
import { useAuth } from '@/features/auth';
import { generateImageUploadData } from '@/utils/uploadImageHelper';

export type CheckinDraftImage = {
  id?: string;
  localUri: string;
  caption?: string;
  imageUrl?: string;
  publicId?: string;
  uploadStatus?: 'pending' | 'uploaded' | 'failed';
  uploadError?: string;
};

type SubmitUserCheckinParams = {
  checkinPointId: string;
  images: CheckinDraftImage[];
};

export function useSubmitUserCheckin() {
  const { getCurrentLocation } = useUserLocation({ autoStart: false });
  const { mutateAsync, isPending } = useCheckinMutation();
  const [uploadingImage, setUploadingImage] = useState(false);
  const { accessToken } = useAuth();

  const submit = useCallback(
    async ({ checkinPointId, images }: SubmitUserCheckinParams) => {
      if (!checkinPointId) {
        throw new Error('Missing check-in point.');
      }

      if (!images.length) {
        throw new Error('Please take at least one photo before finishing check-in.');
      }

      try {
        setUploadingImage(true);
        const currentLocation = await getCurrentLocation();

        if (!currentLocation) {
          throw new Error('Unable to get your location. Please enable location permission and try again.');
        }

        const uploadedImages = [];
        for (let i = 0; i < images.length; i++) {
          const image = images[i];

          if (image.imageUrl) {
            uploadedImages.push({
              imageUrl: image.imageUrl,
              caption: image.caption?.trim() || '',
            });
            continue;
          }

          if (!accessToken) {
            throw new Error('Your session has expired. Please log in again to complete check-in.');
          }

          const filePart = generateImageUploadData(
            {
              localUri: image.localUri,
            },
            i
          );

          const uploadResponse = await checkinServices.uploadCheckinImage(filePart, accessToken);
          logger.info('[useSubmitUserCheckin] Received upload response', { uploadResponse });

          if (!uploadResponse.mediaUrl) {
            throw new Error('Could not upload one of your photos. Please try again.');
          }

          uploadedImages.push({
            imageUrl: uploadResponse.mediaUrl,
            caption: image.caption?.trim() || '',
          });
        }

        logger.info('[useSubmitUserCheckin] Uploaded check-in images', { uploadedImages });

        const payload: UserCheckinRequest = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          method: CheckinMethod.GPS,
          checkinPointId,
          note: images[0]?.caption?.trim() || undefined,
          checkinImageRequest: uploadedImages,
        };

        logger.info('[useSubmitUserCheckin] Submitting check-in', { payload });

        const response = await mutateAsync(payload);
        const statusCode = response?.status ?? 0;
        const isSuccess = (statusCode >= 200 && statusCode < 300) || Boolean(response?.success);

        if (!isSuccess) {
          throw new Error(response?.message ?? 'Unable to complete check-in right now.');
        }

        return {
          message: response?.message,
          imageUrl: uploadedImages[0]?.imageUrl,
          earnedPoints: response?.data?.earnedPoints,
          userTotalPoints: response?.data?.userTotalPoints,
          parentCheckinPointId: response?.data?.parentCheckinPointId,
          checkinPointId: response?.data?.checkinPointId,
        };
      } catch (error) {
        logger.error('[useSubmitUserCheckin] Failed to submit check-in', error);
        throw error instanceof Error
          ? error
          : new Error('An unexpected error occurred while submitting your check-in.');
      } finally {
        setUploadingImage(false);
      }
    },
    [getCurrentLocation, mutateAsync, accessToken]
  );

  // There are 2 loading state, therefore we combine them and return here
  let isSubmitting = isPending || uploadingImage;
  return {
    isSubmitting,
    submit,
  };
}
