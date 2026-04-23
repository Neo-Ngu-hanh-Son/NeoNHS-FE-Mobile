import React, { useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { AllReviewsTemplate } from '@/features/reviews';
import { useAuth } from '@/features/auth';
import { useWorkshopReviews, useCreateWorkshopReview, useUpdateWorkshopReview, useWorkshopDetail } from '../hooks';
import type { ReviewSortKey } from '../hooks';
import type { ReviewResponse } from '@/features/reviews/types';

type Props = StackScreenProps<MainStackParamList, 'WorkshopAllReviews'>;

const SORT_OPTIONS: { label: string; value: ReviewSortKey }[] = [
  { label: 'Most Recent', value: 'createdAt,desc' },
  { label: 'Highest Rated', value: 'rating,desc' },
  { label: 'Lowest Rated', value: 'rating,asc' },
];

export default function WorkshopAllReviewsScreen({ navigation, route }: Props) {
  const { workshopId, workshopName, averageRating: initialAvg, totalRatings: initialTotal } = route.params;
  const { user } = useAuth();

  // Live workshop detail — refetched automatically after any review mutation
  const { data: workshop } = useWorkshopDetail(workshopId);
  const averageRating = workshop?.averageRating ?? initialAvg;
  const totalRatings = workshop?.totalRatings ?? initialTotal;

  const [activeSort, setActiveSort] = React.useState<ReviewSortKey>('createdAt,desc');

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useWorkshopReviews(workshopId, activeSort);

  const createReviewMutation = useCreateWorkshopReview(workshopId);
  const updateReviewMutation = useUpdateWorkshopReview(workshopId);

  // Flatten all pages into a single list
  const allReviews = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  );

  // Detect the current user's own review (if any)
  const myReview: ReviewResponse | undefined = useMemo(
    () => (user ? allReviews.find((r) => r.user.id === user.id) : undefined),
    [allReviews, user]
  );

  const handleSubmitReview = async (rating: number, text: string): Promise<void> => {
    if (myReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: myReview.id,
        request: { rating, comment: text },
      });
    } else {
      await createReviewMutation.mutateAsync({
        rating,
        comment: text,
      });
    }
  };

  return (
    <AllReviewsTemplate
      targetName={workshopName}
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

