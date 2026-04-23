import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/features/reviews/services/reviewService';
import { ReviewTypeFlg, type UpdateReviewRequest } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

/**
 * PUT /api/reviews/{id}; invalidates workshop review list cache.
 */
export function useUpdateWorkshopReview(workshopTemplateId: string) {
  const queryClient = useQueryClient();
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.WORKSHOP, workshopTemplateId);

  return useMutation({
    mutationFn: ({ reviewId, request }: { reviewId: string; request: UpdateReviewRequest }) =>
      reviewService.updateReview(reviewId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...root] });
      queryClient.invalidateQueries({
        queryKey: ['workshop-detail', workshopTemplateId],
      });
    },
  });
}
