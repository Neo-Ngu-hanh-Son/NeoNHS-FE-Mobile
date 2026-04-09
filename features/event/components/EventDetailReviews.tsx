import React, { useMemo } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/features/auth';
import { useEventReviews } from '../hooks/useEventReviews';
import { useCreateEventReview } from '../hooks/useCreateEventReview';
import { useUpdateEventReview } from '../hooks/useUpdateEventReview';
import { ReviewSection } from '@/features/reviews';
import type { ReviewResponse } from '@/features/reviews/types';

interface EventDetailReviewsProps {
  eventId: string;
  eventName: string;
  averageRating: number;
  totalRatings: number;
  onViewAll: () => void;
  onSheetVisibilityChange?: (visible: boolean) => void;
}

export function EventDetailReviews({
  eventId,
  eventName,
  averageRating,
  totalRatings,
  onViewAll,
  onSheetVisibilityChange,
}: EventDetailReviewsProps) {
  const { user } = useAuth();

  const { data, isLoading } = useEventReviews(eventId, 'createdAt,desc');
  const createReviewMutation = useCreateEventReview(eventId);
  const updateReviewMutation = useUpdateEventReview(eventId);

  const allLoaded = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );

  const myReview: ReviewResponse | undefined = useMemo(
    () => (user ? allLoaded.find((r) => r.user?.id === user.id) : undefined),
    [allLoaded, user],
  );

  const handleSubmit = async (rating: number, text: string): Promise<void> => {
    if (myReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: myReview.id,
        request: { rating, comment: text },
      });
      Alert.alert('Updated!', 'Your review has been updated.');
    } else {
      await createReviewMutation.mutateAsync({ rating, comment: text });
      Alert.alert('Thank you!', 'Your review has been submitted.');
    }
  };

  return (
    <ReviewSection
      targetId={eventId}
      targetName={eventName}
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
