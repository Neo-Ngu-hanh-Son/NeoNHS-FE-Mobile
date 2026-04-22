import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { checkinGalleryService } from '@/features/profile/services/checkinGalleryService';
import type { CheckinGalleryImage } from '@/features/profile/types';
import { reviewService } from '@/features/reviews/services/reviewService';
import { ReviewTypeFlg, type CreateReviewRequest } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';
import { logger } from '@/utils/logger';

export function useCheckinGallery(checkinPointId?: string) {
  const query = useQuery({
    queryKey: ['reviews', 'checkin-gallery', checkinPointId],
    enabled: Boolean(checkinPointId),
    queryFn: async () => {
      const response = await checkinGalleryService.getMyCheckinGallery({ checkinPointId });
      return [...response.data].sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
    },
  });

  return {
    ...query,
    images: (query.data ?? []) as CheckinGalleryImage[],
  };
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReviewRequest) => reviewService.createReview(request),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...reviewsQueryKeyRoot(variables.reviewTypeFlg, variables.reviewTypeId)],
      });

      if (variables.reviewTypeFlg === ReviewTypeFlg.WORKSHOP) {
        queryClient.invalidateQueries({ queryKey: ['workshop-detail', variables.reviewTypeId] });
      }

      if (variables.reviewTypeFlg === ReviewTypeFlg.EVENT) {
        queryClient.invalidateQueries({ queryKey: ['event-detail', variables.reviewTypeId] });
      }

      if (variables.reviewTypeFlg === ReviewTypeFlg.POINT) {
        queryClient.invalidateQueries({ queryKey: ['pointDetail', variables.reviewTypeId] });
      }
    },
    onError: (error) => {
      logger.error('[useCreateReview] Failed to create review', error);
    },
  });
}
