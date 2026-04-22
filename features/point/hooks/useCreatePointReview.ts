import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reviewService } from '@/features/reviews/services/reviewService';
import { ReviewTypeFlg } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

export type CreatePointReviewBody = {
  rating: number;
  comment?: string;
  imageUrls?: string[];
};

export function useCreatePointReview(pointId: string) {
  const queryClient = useQueryClient();
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.POINT, pointId);

  return useMutation({
    mutationFn: (body: CreatePointReviewBody) =>
      reviewService.createReview({
        reviewTypeFlg: ReviewTypeFlg.POINT,
        reviewTypeId: pointId,
        ...body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...root] });
      queryClient.invalidateQueries({ queryKey: ['pointDetail', pointId] });
    },
  });
}
