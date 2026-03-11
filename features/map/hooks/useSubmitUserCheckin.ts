import { useCallback, useState } from 'react';

import { uploadImageToCloudinary } from '@/services/cloudinary';
import checkinServices from '@/features/map/services/checkinServices';
import { CheckinMethod, UserCheckinRequest } from '@/features/map/types';
import { useUserLocation } from '@/features/map/hooks/useUserLocation';

export type CheckinDraftImage = {
  localUri: string;
  caption?: string;
};

type SubmitUserCheckinParams = {
  checkinPointId: string;
  images: CheckinDraftImage[];
};

export function useSubmitUserCheckin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { getCurrentLocation } = useUserLocation({ autoStart: false });

  const submit = useCallback(
    async ({ checkinPointId, images }: SubmitUserCheckinParams) => {
      if (!checkinPointId) {
        throw new Error('Missing check-in point.');
      }

      if (!images.length) {
        throw new Error('Please take at least one photo before finishing check-in.');
      }

      setIsSubmitting(true);

      try {
        const currentLocation = await getCurrentLocation();

        if (!currentLocation) {
          throw new Error('Unable to get your location. Please enable location permission and try again.');
        }

        const uploadedImages = await Promise.all(
          images.map(async (image) => {
            const uploadedImageUrl = await uploadImageToCloudinary(image.localUri);

            if (!uploadedImageUrl) {
              throw new Error('Could not upload one of your photos. Please try again.');
            }

            return {
              imageUrl: uploadedImageUrl,
              caption: image.caption,
            };
          })
        );

        const payload: UserCheckinRequest = {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          method: CheckinMethod.GPS,
          checkinPointId,
          imageUrl: uploadedImages[0]?.imageUrl,
          note: uploadedImages[0]?.caption,
          images: uploadedImages,
        };

        const response = await checkinServices.userCheckIn(payload);
        const isSuccess = Boolean(response?.success) || response?.status === 200;

        if (!isSuccess) {
          throw new Error(response?.message ?? 'Unable to complete check-in right now.');
        }

        return {
          message: response?.message,
          imageUrl: uploadedImages[0]?.imageUrl,
        };
      } finally {
        setIsSubmitting(false);
      }
    },
    [getCurrentLocation]
  );

  return {
    isSubmitting,
    submit,
  };
}
