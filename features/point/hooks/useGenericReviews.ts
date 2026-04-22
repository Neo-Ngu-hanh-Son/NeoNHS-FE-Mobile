import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { reviewService } from '@/features/reviews/services/reviewService';
import {
  GenericReviewResponseWrapper,
  ReviewTypeFlgValue,
  type ReviewSortBy,
  type ReviewSortDir,
} from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

export type ReviewSortKey = `${ReviewSortBy},${ReviewSortDir}`;

const PAGE_SIZE = 10;


export function useGenericReviews(reviewTypeId: string, reviewTypeFlag: ReviewTypeFlgValue, sort: ReviewSortKey = 'createdAt,desc') {
  const root = reviewsQueryKeyRoot(reviewTypeFlag, reviewTypeId);
  const [sortBy, sortDir] = sort.split(',') as [ReviewSortBy, ReviewSortDir];

  return useInfiniteQuery<GenericReviewResponseWrapper>({
    queryKey: [...root, sort],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await reviewService.getGenericReviews({
        page: pageParam as number,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        reviewTypeFlg: reviewTypeFlag,
        reviewTypeId: reviewTypeId,
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage?.reviews?.last === true || lastPage?.reviews?.empty === true) {
        return undefined;
      }

      const currentPage = lastPage?.reviews?.page ?? 0;
      const totalPages = lastPage?.reviews?.totalPages ?? 1;

      if (currentPage + 1 >= totalPages) {
        return undefined;
      }

      return currentPage + 1;
    },
    enabled: !!reviewTypeId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
