import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { reviewService } from '@/features/reviews/services/reviewService';
import { ReviewTypeFlg, type ReviewPageResponse, type ReviewSortBy, type ReviewSortDir } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

export type ReviewSortKey = `${ReviewSortBy},${ReviewSortDir}`;

const PAGE_SIZE = 10;

function normalizePage(raw: any): ReviewPageResponse {
  if (!raw) return emptyPage();

  if (Array.isArray(raw.content)) return flattenPageMeta(raw);
  if (raw.data && Array.isArray(raw.data.content)) return flattenPageMeta(raw.data);
  if (Array.isArray(raw)) {
    return {
      content: raw, totalElements: raw.length, totalPages: 1,
      size: raw.length, last: true, first: true, empty: raw.length === 0,
    };
  }

  console.warn('[useEventReviews] Unexpected response shape:', JSON.stringify(raw).slice(0, 500));
  return emptyPage();
}

function flattenPageMeta(page: any): ReviewPageResponse {
  const nested = typeof page.page === 'object' && page.page !== null ? page.page : null;
  return {
    content: page.content ?? [],
    size: page.size ?? nested?.size ?? PAGE_SIZE,
    totalElements: page.totalElements ?? nested?.totalElements ?? page.content?.length ?? 0,
    totalPages: page.totalPages ?? nested?.totalPages ?? 1,
    number: page.number ?? nested?.number ?? 0,
    page: typeof page.page === 'number' ? page.page : undefined,
    first: page.first ?? nested?.first,
    last: page.last ?? nested?.last,
    empty: page.empty ?? nested?.empty ?? (page.content?.length === 0),
  };
}

function emptyPage(): ReviewPageResponse {
  return { content: [], totalElements: 0, totalPages: 0, size: PAGE_SIZE, last: true, first: true, empty: true };
}

/**
 * Infinite-scroll hook for event reviews.
 * GET /api/reviews/events/{eventId}
 */
export function useEventReviews(eventId: string, sort: ReviewSortKey = 'createdAt,desc') {
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.EVENT, eventId);
  const [sortBy, sortDir] = sort.split(',') as [ReviewSortBy, ReviewSortDir];

  return useInfiniteQuery<ReviewPageResponse>({
    queryKey: [...root, sort],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await reviewService.getEventReviews(eventId, {
        page: pageParam as number, size: PAGE_SIZE, sortBy, sortDir,
      });
      return normalizePage(response.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last === true || lastPage.empty === true) return undefined;
      const currentPage =
        (typeof lastPage.page === 'number' ? lastPage.page : undefined) ??
        (typeof lastPage.number === 'number' ? lastPage.number : undefined) ?? 0;
      const totalPages = lastPage.totalPages ?? 1;
      if (currentPage + 1 >= totalPages) return undefined;
      return currentPage + 1;
    },
    enabled: !!eventId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
