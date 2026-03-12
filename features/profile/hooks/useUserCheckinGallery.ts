import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { checkinGalleryService } from '@/features/profile/services/checkinGalleryService';
import type { CheckinGalleryImage } from '@/features/profile/types';

export function useUserCheckinGallery() {
  const query = useQuery({
    queryKey: ['profile', 'checkin-gallery'],
    queryFn: async () => {
      const response = await checkinGalleryService.getMyCheckinGallery();
      return response.data;
    },
  });

  const images = useMemo(() => {
    const galleryItems = query.data ?? [];
    return [...galleryItems].sort(
      (a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
    );
  }, [query.data]);

  return {
    ...query,
    images: images as CheckinGalleryImage[],
  };
}
