import React, { useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { AllReviewsTemplate } from '@/features/reviews';
import { useAuth } from '@/features/auth';
import { useEventReviews } from '../hooks/useEventReviews';
import { useCreateEventReview } from '../hooks/useCreateEventReview';
import { useUpdateEventReview } from '../hooks/useUpdateEventReview';
import { useEventDetail } from '../hooks/useEventDetail';
import type { ReviewSortKey } from '../hooks/useEventReviews';
import type { ReviewResponse } from '@/features/reviews/types';

type Props = StackScreenProps<MainStackParamList, 'EventAllReviews'>;

const SORT_OPTIONS: { label: string; value: ReviewSortKey }[] = [
  { label: 'Most Recent', value: 'createdAt,desc' },
  { label: 'Highest Rated', value: 'rating,desc' },
  { label: 'Lowest Rated', value: 'rating,asc' },
];

export default function EventAllReviewsScreen({ navigation, route }: Props) {
  const {
    eventId,
    eventName,
    averageRating: initialAvg,
    totalRatings: initialTotal,
  } = route.params;
  const { user } = useAuth();

  const { data: event } = useEventDetail(eventId);
  const averageRating = event?.averageRating ?? initialAvg;
  const totalRatings = event?.totalRatings ?? initialTotal;

  const [activeSort, setActiveSort] = React.useState<ReviewSortKey>('createdAt,desc');

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useEventReviews(eventId, activeSort);

  const createReviewMutation = useCreateEventReview(eventId);
  const updateReviewMutation = useUpdateEventReview(eventId);

  const allReviews = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data],
  );

  const myReview: ReviewResponse | undefined = useMemo(
    () => (user ? allReviews.find((r) => r.user?.id === user.id) : undefined),
    [allReviews, user],
  );

  const handleSubmitReview = async (rating: number, text: string): Promise<void> => {
    if (myReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: myReview.id,
        request: { rating, comment: text },
      });
    } else {
      await createReviewMutation.mutateAsync({ rating, comment: text });
    }
  };

  return (
    <AllReviewsTemplate
      targetName={eventName}
      averageRating={averageRating}
      totalRatings={totalRatings}
      reviews={allReviews}
      myReview={myReview}
      isLoading={isLoading}
      isFetching={isFetching}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      error={error}
      activeSort={activeSort}
      onSortChange={(sort) => setActiveSort(sort as ReviewSortKey)}
      sortOptions={SORT_OPTIONS}
      onLoadMore={() => { if (hasNextPage) fetchNextPage(); }}
      onSubmitReview={handleSubmitReview}
      onGoBack={() => navigation.goBack()}
    />
  );
}
