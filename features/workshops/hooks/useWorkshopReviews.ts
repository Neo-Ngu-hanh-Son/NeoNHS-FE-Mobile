import { useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { workshopService } from '../services/workshopService';
import type { WorkshopReviewPageResponse } from '../types';

export type ReviewSortKey = 'createdAt,desc' | 'rating,desc' | 'rating,asc';

const PAGE_SIZE = 10;

/**
 * Infinite-scroll hook for workshop reviews.
 * Maps to GET /api/reviews/workshops/{workshopTemplateId}
 */
export function useWorkshopReviews(
  workshopTemplateId: string,
  sort: ReviewSortKey = 'createdAt,desc'
) {
  return useInfiniteQuery<WorkshopReviewPageResponse>({
    queryKey: ['workshop-reviews', workshopTemplateId, sort],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await workshopService.getReviews(workshopTemplateId, {
        page: pageParam as number,
        size: PAGE_SIZE,
        sort,
      });
      return response.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // Guard 1: explicit last-page flag from the API
      if (lastPage.last === true) return undefined;

      // Guard 2: math-based fallback — covers cases where `last` is absent OR
      // where the backend uses `number` (Spring standard) instead of `page`.
      const currentPage = lastPage.page ?? lastPage.number ?? 0;
      const totalPages = lastPage.totalPages ?? 1;
      if (currentPage + 1 >= totalPages) return undefined;

      return currentPage + 1;
    },
    enabled: !!workshopTemplateId,
    // Keep the previous sort's data visible while the new sort is fetching
    // so isLoading stays false and the list doesn't flash/disappear.
    placeholderData: keepPreviousData,
    // Don't re-fetch just because the keyboard opened or a modal was dismissed.
    refetchOnWindowFocus: false,
    // Limit retries so a failed request doesn't flood the log with retries.
    retry: 1,
  });
}
