import React, { useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth';
import { useWorkshopReviews, useCreateWorkshopReview, useUpdateWorkshopReview } from '../hooks';
import { ReviewSection } from '@/features/reviews';
import type { ReviewResponse } from '@/features/reviews/types';

interface WorkshopDetailReviewsProps {
  workshopId: string;
  workshopName: string;
  averageRating: number;
  totalRatings: number;
  onViewAll: () => void;
  onSheetVisibilityChange?: (visible: boolean) => void;
}

export function WorkshopDetailReviews({
  workshopId,
  workshopName,
  averageRating,
  totalRatings,
  onViewAll,
  onSheetVisibilityChange,
}: WorkshopDetailReviewsProps) {
  const { user } = useAuth();
  
  const { data, isLoading } = useWorkshopReviews(workshopId, 'createdAt,desc');
  const createReviewMutation = useCreateWorkshopReview(workshopId);
  const updateReviewMutation = useUpdateWorkshopReview(workshopId);

  const allLoaded = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data]
  );

  const myReview: ReviewResponse | undefined = useMemo(
    () => (user ? allLoaded.find((r) => r.user.id === user.id) : undefined),
    [allLoaded, user]
  );

  const handleSubmit = async (rating: number, text: string): Promise<void> => {
    if (myReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: myReview.id,
        request: { rating, comment: text },
      });
      Alert.alert('Updated!', 'Your review has been updated.');
    } else {
      await createReviewMutation.mutateAsync({
        rating,
        comment: text,
      });
      Alert.alert('Thank you!', 'Your review has been submitted.');
    }
  };

  return (
    <ReviewSection
      targetId={workshopId}
      targetName={workshopName}
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

