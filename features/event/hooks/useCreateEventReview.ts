import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/features/reviews/services/reviewService';
import { ReviewTypeFlg } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

export type CreateEventReviewBody = {
  rating: number;
  comment?: string;
  imageUrls?: string[];
};

/**
 * POST /api/reviews with reviewTypeFlg=2 (event) + event id.
 */
export function useCreateEventReview(eventId: string) {
  const queryClient = useQueryClient();
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.EVENT, eventId);

  return useMutation({
    mutationFn: (body: CreateEventReviewBody) =>
      reviewService.createReview({
        reviewTypeFlg: ReviewTypeFlg.EVENT,
        reviewTypeId: eventId,
        ...body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...root] });
      queryClient.invalidateQueries({ queryKey: ['event-detail', eventId] });
    },
  });
}
