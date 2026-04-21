import React, { useMemo } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/features/auth';
import { ReviewSection } from '@/features/reviews';
import { useCreatePointReview, usePointReviews, useUpdatePointReview } from '@/features/point/hooks';
import { logger } from '@/utils/logger';

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

  const { data, isLoading, fetchNextPage } = usePointReviews(pointId, 'createdAt,desc');
  const createReviewMutation = useCreatePointReview(pointId);
  const updateReviewMutation = useUpdatePointReview(pointId);

  const allReviews = useMemo(() => data?.pages.flatMap((page) => page.reviews.content) ?? [], [data]);
  const myReview = useMemo(
    () => (user ? allReviews.find((review) => review.id === user.id) : undefined),
    [allReviews, user]
  );

  const avgRating = useMemo(() => data?.pages[0].avgRating ?? 0, [data]);
  const totalRatings = useMemo(() => data?.pages[0].totalReviews ?? 0, [data]);

  const handleSubmit = async (rating: number, text: string): Promise<void> => {
    if (myReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: myReview.id,
        request: { rating, comment: text },
      });
      Alert.alert('Updated!', 'Your review has been updated.');
      return;
    }

    await createReviewMutation.mutateAsync({
      rating,
      comment: text,
    });
    Alert.alert('Thank you!', 'Your review has been submitted.');
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
