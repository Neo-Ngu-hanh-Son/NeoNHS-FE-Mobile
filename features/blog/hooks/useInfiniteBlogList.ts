import { useInfiniteQuery } from '@tanstack/react-query';
import { blogService } from '../services/blogService';

interface UseInfiniteBlogListParams {
  search?: string;
  categorySlug?: string;
  size?: number;
}

/**
 * Infinite-scrolling blog list hook powered by TanStack `useInfiniteQuery`.
 *
 * Filters by `search` (server-side) and `categorySlug`.
 * Pages are fetched automatically as the user scrolls.
 */
export function useInfiniteBlogList({
  search,
  categorySlug,
  size = 5,
}: UseInfiniteBlogListParams = {}) {
  const normalizedSearch = search?.trim() || undefined;

  return useInfiniteQuery({
    queryKey: ['blogs-infinite', normalizedSearch, categorySlug],
    queryFn: async ({ pageParam = 0 }) => {
      const page = await blogService.getBlogPreviews({
        page: pageParam,
        size,
        search: normalizedSearch,
        categorySlug,
        status: 'PUBLISHED',
        sortBy: 'publishedAt',
        sortDir: 'desc',
      });
      return page;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
  });
}
