import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { reviewService } from '@/features/reviews/services/reviewService';
import {
  ReviewTypeFlg,
  type ReviewPageResponse,
  type ReviewSortBy,
  type ReviewSortDir,
} from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

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

function normalizePage(raw: unknown): ReviewPageResponse {
  if (!raw) {
    return emptyPage();
  }

  if (isRecord(raw) && Array.isArray(raw.content)) {
    return flattenPageMeta(raw);
  }

  if (isRecord(raw) && isRecord(raw.data) && Array.isArray(raw.data.content)) {
    return flattenPageMeta(raw.data);
  }

  if (Array.isArray(raw)) {
    return {
      content: raw,
      totalElements: raw.length,
      totalPages: 1,
      size: raw.length,
      last: true,
      first: true,
      empty: raw.length === 0,
    };
  }

  return emptyPage();
}

function flattenPageMeta(page: Record<string, unknown>): ReviewPageResponse {
  const nested = isRecord(page.page) ? page.page : null;
  const content = (Array.isArray(page.content) ? page.content : []) as ReviewPageResponse['content'];

  return {
    content,
    size: asNumber(page.size) ?? asNumber(nested?.size) ?? PAGE_SIZE,
    totalElements: asNumber(page.totalElements) ?? asNumber(nested?.totalElements) ?? content.length,
    totalPages: asNumber(page.totalPages) ?? asNumber(nested?.totalPages) ?? 1,
    number: asNumber(page.number) ?? asNumber(nested?.number) ?? 0,
    page: asNumber(page.page),
    first: asBoolean(page.first) ?? asBoolean(nested?.first),
    last: asBoolean(page.last) ?? asBoolean(nested?.last),
    empty: asBoolean(page.empty) ?? asBoolean(nested?.empty) ?? content.length === 0,
  };
}

function emptyPage(): ReviewPageResponse {
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

  return useInfiniteQuery<ReviewPageResponse>({
    queryKey: [...root, sort],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await reviewService.getPointReviews(pointId, {
        page: pageParam as number,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
      });

      return normalizePage(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last === true || lastPage.empty === true) {
        return undefined;
      }

      const currentPage =
        (typeof lastPage.page === 'number' ? lastPage.page : undefined) ??
        (typeof lastPage.number === 'number' ? lastPage.number : undefined) ??
        0;
      const totalPages = lastPage.totalPages ?? 1;

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
