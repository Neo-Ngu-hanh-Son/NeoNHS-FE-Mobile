import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reviewService } from '@/features/reviews/services/reviewService';
import type { UpdateReviewRequest } from '@/features/reviews/types';
import { ReviewTypeFlg } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

export function useUpdatePointReview(pointId: string) {
  const queryClient = useQueryClient();
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.POINT, pointId);

  return useMutation({
    mutationFn: ({ reviewId, request }: { reviewId: string; request: UpdateReviewRequest }) =>
      reviewService.updateReview(reviewId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...root] });
      queryClient.invalidateQueries({ queryKey: ['pointDetail', pointId] });
    },
  });
}
