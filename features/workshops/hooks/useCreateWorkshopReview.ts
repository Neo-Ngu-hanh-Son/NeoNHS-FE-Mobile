import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/features/reviews/services/reviewService';
import { ReviewTypeFlg } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

export type CreateWorkshopReviewBody = {
  rating: number;
  comment?: string;
  imageUrls?: string[];
};

/**
 * POST /api/reviews with reviewTypeFlg=1 (workshop) + template id.
 */
export function useCreateWorkshopReview(workshopTemplateId: string) {
  const queryClient = useQueryClient();
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.WORKSHOP, workshopTemplateId);

  return useMutation({
    mutationFn: (body: CreateWorkshopReviewBody) =>
      reviewService.createReview({
        reviewTypeFlg: ReviewTypeFlg.WORKSHOP,
        reviewTypeId: workshopTemplateId,
        ...body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...root] });
      queryClient.invalidateQueries({
        queryKey: ['workshop-detail', workshopTemplateId],
      });
    },
  });
}
