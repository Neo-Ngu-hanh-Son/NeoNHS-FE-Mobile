import { useInfiniteQuery } from '@tanstack/react-query';
import { workshopService } from '../services/workshopService';
import type { WorkshopSearchParams, WorkshopPageResponse, WorkshopTemplateResponse } from '../types';

/**
 * Infinite-scroll search hook for workshop templates.
 * Wraps GET /api/public/workshops/templates/search with useInfiniteQuery.
 */
export function useWorkshopSearch(params: Omit<WorkshopSearchParams, 'page'>) {
  return useInfiniteQuery<WorkshopPageResponse<WorkshopTemplateResponse>>({
    queryKey: ['workshop-search', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await workshopService.searchTemplates({
        ...params,
        page: pageParam as number,
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.last) return undefined;
      return (lastPageParam as number) + 1;
    },
  });
}
