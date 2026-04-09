import { useCallback, useState } from 'react';

import checkinServices from '@/features/map/services/checkinServices';
import { CheckinImageRequest, CheckinMethod, UserCheckinRequest } from '@/features/map/types';
import { useUserLocation } from '@/features/map/hooks/useUserLocation';
import { logger } from '@/utils/logger';
import { useCheckinMutation } from './Checkin/useCheckinMutation';

export type CheckinDraftImage = {
  localUri: string;
  caption?: string;
};

type SubmitUserCheckinParams = {
  checkinPointId: string;
  images: CheckinDraftImage[];
};

export function useSubmitUserCheckin() {
  const { getCurrentLocation } = useUserLocation({ autoStart: false });
  const { mutateAsync, isPending } = useCheckinMutation();
  const [uploadingImage, setUploadingImage] = useState(false);

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

        const fileParts = images.map((image, index) => {
          const fileName = image.localUri.split('/').pop() || `checkin-${index + 1}.jpg`;
          const extension = fileName.split('.').pop()?.toLowerCase();
          const mimeType = extension ? `image/${extension === 'jpg' ? 'jpeg' : extension}` : 'image/jpeg';

          return {
            uri: image.localUri,
            name: fileName,
            type: mimeType,
          };
        });

        const uploadedImages = await Promise.all(
          fileParts.map(async (filePart, index) => {
            const uploadResponse = await checkinServices.uploadCheckinImage(filePart);
            const imageUrl = uploadResponse?.data;

            if (!imageUrl) {
              throw new Error('Could not upload one of your photos. Please try again.');
            }

            return {
              imageUrl,
              caption: images[index]?.caption?.trim() || '',
            } as CheckinImageRequest;
          })
        );

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
    [getCurrentLocation, mutateAsync]
  );

  // There are 2 loading state, therefore we combine them and return here
  let isSubmitting = isPending || uploadingImage;
  return {
    isSubmitting,
    submit,
  };
}
