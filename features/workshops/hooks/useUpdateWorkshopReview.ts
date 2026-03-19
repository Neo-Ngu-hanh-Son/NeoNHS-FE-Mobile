import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workshopService } from '../services/workshopService';
import type { UpdateReviewRequest } from '../types';

/**
 * Mutation hook for updating the current user's existing workshop review.
 * Maps to PUT /api/reviews/{id}  (requires TOURIST + review ownership).
 * On success, invalidates all cached review pages for that workshop.
 */
export function useUpdateWorkshopReview(workshopTemplateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, request }: { reviewId: string; request: UpdateReviewRequest }) =>
      workshopService.updateReview(reviewId, request),
    onSuccess: () => {
      // Refresh the review list
      queryClient.invalidateQueries({
        queryKey: ['workshop-reviews', workshopTemplateId],
      });
      // Refresh the workshop detail so averageRating / totalRatings update
      queryClient.invalidateQueries({
        queryKey: ['workshop-detail', workshopTemplateId],
      });
    },
  });
}
