import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { reviewService } from '@/features/reviews/services/reviewService';
import { ReviewTypeFlg, type ReviewPageResponse, type ReviewSortBy, type ReviewSortDir } from '@/features/reviews/types';
import { reviewsQueryKeyRoot } from '@/features/reviews/utils';

/**
 * Compound sort key used by UI chips — split into sortBy / sortDir
 * before sending to the API.
 */
export type ReviewSortKey = `${ReviewSortBy},${ReviewSortDir}`;

const PAGE_SIZE = 10;

/**
 * Normalize any backend response shape into a flat ReviewPageResponse.
 *
 * Spring Boot may nest page metadata under a `page` sub-object
 * (Spring Boot 3.2+).  The apiClient's transformResponse already strips
 * one layer of { status, data: ... }, but some endpoints may
 * double-wrap or use a different format.
 */
function normalizePage(raw: any): ReviewPageResponse {
  if (!raw) {
    console.warn('[useWorkshopReviews] API returned null/undefined');
    return emptyPage();
  }

  if (Array.isArray(raw.content)) {
    return flattenPageMeta(raw);
  }

  if (raw.data && Array.isArray(raw.data.content)) {
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

  console.warn(
    '[useWorkshopReviews] Unexpected response shape:',
    JSON.stringify(raw).slice(0, 500),
  );
  return emptyPage();
}

function flattenPageMeta(page: any): ReviewPageResponse {
  const nested =
    typeof page.page === 'object' && page.page !== null ? page.page : null;
  return {
    content: page.content ?? [],
    size: page.size ?? nested?.size ?? PAGE_SIZE,
    totalElements:
      page.totalElements ?? nested?.totalElements ?? page.content?.length ?? 0,
    totalPages: page.totalPages ?? nested?.totalPages ?? 1,
    number: page.number ?? nested?.number ?? 0,
    page: typeof page.page === 'number' ? page.page : undefined,
    first: page.first ?? nested?.first,
    last: page.last ?? nested?.last,
    empty: page.empty ?? nested?.empty ?? (page.content?.length === 0),
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

/**
 * Infinite-scroll hook for workshop template reviews.
 * GET /api/reviews/workshops/{workshopTemplateId}
 */
export function useWorkshopReviews(
  workshopTemplateId: string,
  sort: ReviewSortKey = 'createdAt,desc',
) {
  const root = reviewsQueryKeyRoot(ReviewTypeFlg.WORKSHOP, workshopTemplateId);
  const [sortBy, sortDir] = sort.split(',') as [ReviewSortBy, ReviewSortDir];

  return useInfiniteQuery<ReviewPageResponse>({
    queryKey: [...root, sort],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await reviewService.getWorkshopReviews(
        workshopTemplateId,
        { page: pageParam as number, size: PAGE_SIZE, sortBy, sortDir },
      );

      const normalized = normalizePage(response.data);

      if (__DEV__) {
        console.log(
          `[useWorkshopReviews] page=${pageParam}`,
          `keys=${response.data ? Object.keys(response.data) : 'null'}`,
          `content.length=${normalized.content.length}`,
          `totalElements=${normalized.totalElements}`,
        );
      }

      return normalized;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last === true) return undefined;
      if (lastPage.empty === true) return undefined;

      const currentPage =
        (typeof lastPage.page === 'number' ? lastPage.page : undefined) ??
        (typeof lastPage.number === 'number' ? lastPage.number : undefined) ??
        0;
      const totalPages = lastPage.totalPages ?? 1;

      if (currentPage + 1 >= totalPages) return undefined;
      return currentPage + 1;
    },
    enabled: !!workshopTemplateId,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
