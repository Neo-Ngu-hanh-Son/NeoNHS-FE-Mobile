import React, { useMemo } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/features/auth';
import { ReviewSection, ReviewTypeFlg } from '@/features/reviews';
import { useCreatePointReview, usePointReviews, useUpdatePointReview } from '@/features/point/hooks';
import { logger } from '@/utils/logger';
import { useGenericReviews } from '../hooks/useGenericReviews';
import { useModal } from '@/app/providers/ModalProvider';

interface PointDetailReviewsProps {
  pointId: string;
  pointName: string;
  onViewAll: () => void;
  onSheetVisibilityChange?: (visible: boolean) => void;
}

export function PointDetailReviews({
  pointId,
  pointName,
  onViewAll,
  onSheetVisibilityChange,
}: PointDetailReviewsProps) {
  const { user } = useAuth();

  const { data, isLoading } = useGenericReviews(pointId, ReviewTypeFlg.POINT);
  const { mutateAsync: createReview, error: createError } = useCreatePointReview(pointId);
  const { mutateAsync: updateReview, error: updateError } = useUpdatePointReview(pointId);
  const { alert } = useModal();

  const allReviews = useMemo(() => data?.pages.flatMap((page) => page.reviews?.content ?? []) ?? [], [data]);
  const myReview = useMemo(
    () => (user ? allReviews.find((review) => review.user.id === user.id) : undefined),
    [allReviews, user]
  );

  const avgRating = useMemo(() => data?.pages[0].avgRating ?? 0, [data]);
  const totalRatings = useMemo(() => data?.pages[0].totalReviews ?? 0, [data]);

  /**
   * Note : Update review is prohibited.
   */
  const handleSubmit = async (rating: number, text: string, reviewId: string): Promise<void> => {
    if (myReview) {
      const res = await updateReview({
        reviewId,
        request: {
          rating,
          comment: text,
        },
      });
      if (!res.success) {
        alert({ title: 'Error', message: `Review update failed: ${res.message}` });
      }
    } else {
      const res = await createReview({
        rating,
        comment: text,
      });
      if (!res.success) {
        alert({ title: 'Error', message: `Review submission failed: ${res.message}` });
      }
    }
  };

  return (
    <ReviewSection
      targetId={pointId}
      targetName={pointName}
      averageRating={avgRating}
      totalRatings={totalRatings}
      reviews={allReviews}
      isLoading={isLoading}
      myReview={myReview ?? undefined}
      onSubmitReview={handleSubmit}
      onViewAll={onViewAll}
      onSheetVisibilityChange={onSheetVisibilityChange}
    />
  );
}
