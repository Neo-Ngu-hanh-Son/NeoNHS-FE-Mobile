import React, { useMemo } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/features/auth';
import { ReviewSection, ReviewTypeFlg } from '@/features/reviews';
import { useCreateEventReview } from '../hooks/useCreateEventReview';
import { useUpdateEventReview } from '../hooks/useUpdateEventReview';
import { useGenericReviews } from '@/features/point/hooks/useGenericReviews';

interface EventDetailReviewsProps {
  eventId: string;
  eventName: string;
  onViewAll: () => void;
  onSheetVisibilityChange?: (visible: boolean) => void;
}

export function EventDetailReviews({
  eventId,
  eventName,
  onViewAll,
  onSheetVisibilityChange,
}: EventDetailReviewsProps) {
  const { user } = useAuth();

  const { data, isLoading } = useGenericReviews(eventId, ReviewTypeFlg.EVENT);
  const createReviewMutation = useCreateEventReview(eventId);
  const updateReviewMutation = useUpdateEventReview(eventId);

  const allReviews = useMemo(() => data?.pages.flatMap((page) => page.reviews?.content ?? []) ?? [], [data]);
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
    } else {
      await createReviewMutation.mutateAsync({ rating, comment: text });
      Alert.alert('Thank you!', 'Your review has been submitted.');
    }
  };

  return (
    <ReviewSection
      targetId={eventId}
      targetName={eventName}
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
