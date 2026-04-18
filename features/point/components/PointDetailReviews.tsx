import React, { useMemo } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/features/auth';
import { ReviewSection } from '@/features/reviews';
import type { ReviewResponse } from '@/features/reviews/types';
import { useCreatePointReview, usePointReviews, useUpdatePointReview } from '@/features/point/hooks';

interface PointDetailReviewsProps {
  pointId: string;
  pointName: string;
  averageRating: number;
  totalRatings: number;
  onViewAll: () => void;
  onSheetVisibilityChange?: (visible: boolean) => void;
}

export function PointDetailReviews({
  pointId,
  pointName,
  averageRating,
  totalRatings,
  onViewAll,
  onSheetVisibilityChange,
}: PointDetailReviewsProps) {
  const { user } = useAuth();

  const { data, isLoading } = usePointReviews(pointId, 'createdAt,desc');
  const createReviewMutation = useCreatePointReview(pointId);
  const updateReviewMutation = useUpdatePointReview(pointId);

  const allLoaded = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data]);

  const myReview: ReviewResponse | undefined = useMemo(
    () => (user ? allLoaded.find((review) => review.user.id === user.id) : undefined),
    [allLoaded, user]
  );

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
      averageRating={averageRating}
      totalRatings={totalRatings}
      reviews={allLoaded}
      isLoading={isLoading}
      myReview={myReview}
      onSubmitReview={handleSubmit}
      onViewAll={onViewAll}
      onSheetVisibilityChange={onSheetVisibilityChange}
    />
  );
}
