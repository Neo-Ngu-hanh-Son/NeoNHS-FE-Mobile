import { useMutation, useQueryClient } from '@tanstack/react-query';
import { workshopService } from '../services/workshopService';
import type { CreateReviewRequest } from '../types';

/**
 * Mutation hook for submitting a workshop review.
 * Maps to POST /api/reviews (requires TOURIST authentication).
 * On success, invalidates all cached review pages for that workshop.
 */
export function useCreateWorkshopReview(workshopTemplateId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateReviewRequest) =>
      workshopService.createReview(request),
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
