import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { reviewService } from '@/features/reviews/services/reviewService';
import {
  PointReviewResponse,
  PointReviewResponseWrapper,
  ReviewTypeFlg,
  type ReviewSortBy,
  type ReviewSortDir,
} from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';
import { PageResponse } from '@/services/api';
import { logger } from '@/utils/logger';

export type ReviewSortKey = `${ReviewSortBy},${ReviewSortDir}`;

const PAGE_SIZE = 10;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function emptyPage() {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: PAGE_SIZE,
    last: true,
    first: true,
    empty: true,
  };
}

export function usePointReviews(pointId: string, sort: ReviewSortKey = 'createdAt,desc') {
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.POINT, pointId);
  const [sortBy, sortDir] = sort.split(',') as [ReviewSortBy, ReviewSortDir];

  return useInfiniteQuery<PointReviewResponseWrapper>({
    queryKey: [...root, sort],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await reviewService.getPointReviews(pointId, {
        page: pageParam as number,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
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
    enabled: !!pointId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
