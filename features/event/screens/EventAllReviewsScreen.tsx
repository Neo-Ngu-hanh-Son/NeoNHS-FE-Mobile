import React, { useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { AllReviewsTemplate } from '@/features/reviews';
import { useAuth } from '@/features/auth';
import { useGenericReviews } from '@/features/point/hooks/useGenericReviews';
import { useCreateEventReview } from '../hooks/useCreateEventReview';
import { useUpdateEventReview } from '../hooks/useUpdateEventReview';
import { ReviewTypeFlg } from '@/features/reviews/types';
import type { ReviewSortKey } from '@/features/point/hooks/useGenericReviews';
import type { ReviewResponse } from '@/features/reviews/types';

type Props = StackScreenProps<MainStackParamList, 'EventAllReviews'>;

const SORT_OPTIONS: { label: string; value: ReviewSortKey }[] = [
  { label: 'Most Recent', value: 'createdAt,desc' },
  { label: 'Highest Rated', value: 'rating,desc' },
  { label: 'Lowest Rated', value: 'rating,asc' },
];

export default function EventAllReviewsScreen({ navigation, route }: Props) {
  const { eventId, eventName } = route.params;
  const { user } = useAuth();

  const [activeSort, setActiveSort] = React.useState<ReviewSortKey>('createdAt,desc');

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, error } = useGenericReviews(
    eventId,
    ReviewTypeFlg.EVENT,
    activeSort
  );

  const createReviewMutation = useCreateEventReview(eventId);
  const updateReviewMutation = useUpdateEventReview(eventId);

  const avgRating = useMemo(() => data?.pages[0].avgRating ?? 0, [data]);
  const totalRatings = useMemo(() => data?.pages[0].totalReviews ?? 0, [data]);

  const allReviews = useMemo(() => data?.pages.flatMap((page) => page.reviews?.content ?? []) ?? [], [data]);
  const myReview: ReviewResponse | undefined = useMemo(
    () => (user ? allReviews.find((review) => review.user.id === user.id) : undefined),
    [allReviews, user]
  );

  const handleSubmitReview = async (rating: number, text: string): Promise<void> => {
    if (myReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: myReview.id,
        request: { rating, comment: text },
      });
      return;
    }

    await createReviewMutation.mutateAsync({ rating, comment: text });
  };

  return (
    <AllReviewsTemplate
      targetName={eventName}
      averageRating={avgRating}
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
      onLoadMore={() => {
        if (hasNextPage) {
          fetchNextPage();
        }
      }}
      onSubmitReview={handleSubmitReview}
      onGoBack={() => navigation.goBack()}
    />
  );
}
