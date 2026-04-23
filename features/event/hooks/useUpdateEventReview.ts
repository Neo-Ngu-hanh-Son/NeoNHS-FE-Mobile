import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/features/reviews/services/reviewService';
import { ReviewTypeFlg, type UpdateReviewRequest } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

/**
 * PUT /api/reviews/{id}; invalidates event review list cache.
 */
export function useUpdateEventReview(eventId: string) {
  const queryClient = useQueryClient();
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.EVENT, eventId);

  return useMutation({
    mutationFn: ({ reviewId, request }: { reviewId: string; request: UpdateReviewRequest }) =>
      reviewService.updateReview(reviewId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...root] });
      queryClient.invalidateQueries({ queryKey: ['event-detail', eventId] });
    },
  });
}
