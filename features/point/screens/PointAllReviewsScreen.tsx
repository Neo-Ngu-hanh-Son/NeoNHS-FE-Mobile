import React, { useMemo } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useQuery } from '@tanstack/react-query';

import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { AllReviewsTemplate } from '@/features/reviews';
import { useAuth } from '@/features/auth';
import { discoverService } from '@/features/discover/services/discoverServices';
import { useCreatePointReview, usePointReviews, useUpdatePointReview } from '@/features/point/hooks';
import type { ReviewSortKey } from '@/features/point/hooks';
import type { ReviewResponse } from '@/features/reviews/types';

type Props = StackScreenProps<MainStackParamList, 'PointAllReviews'>;

const SORT_OPTIONS: { label: string; value: ReviewSortKey }[] = [
  { label: 'Most Recent', value: 'createdAt,desc' },
  { label: 'Highest Rated', value: 'rating,desc' },
  { label: 'Lowest Rated', value: 'rating,asc' },
];

export default function PointAllReviewsScreen({ navigation, route }: Props) {
  const { pointId, pointName, averageRating: initialAvg, totalRatings: initialTotal } = route.params;
  const { user } = useAuth();

  const [activeSort, setActiveSort] = React.useState<ReviewSortKey>('createdAt,desc');

  const { data: point } = useQuery({
    queryKey: ['pointDetail', pointId],
    queryFn: async () => {
      const response = await discoverService.getPointById(pointId);
      return response.data;
    },
    enabled: Boolean(pointId),
  });

  const averageRating = Number((point as { averageRating?: number } | undefined)?.averageRating ?? initialAvg ?? 0);
  const totalRatings = Number((point as { totalRatings?: number } | undefined)?.totalRatings ?? initialTotal ?? 0);

  const { data, isLoading, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage, error } = usePointReviews(
    pointId,
    activeSort
  );

  const createReviewMutation = useCreatePointReview(pointId);
  const updateReviewMutation = useUpdatePointReview(pointId);

  const allReviews = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data]);

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

    await createReviewMutation.mutateAsync({
      rating,
      comment: text,
    });
  };

  return (
    <AllReviewsTemplate
      targetName={pointName}
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
