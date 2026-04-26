import { useInfiniteQuery } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';

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
  const { language } = useLanguage();

  return useInfiniteQuery({
    queryKey: ['blogs-infinite', normalizedSearch, categorySlug, language],
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

      if (language !== 'vi' && page.content && page.content.length > 0) {
        const fieldsToTranslate: Record<string, string> = {};
        page.content.forEach((blog) => {
          if (blog.title) fieldsToTranslate[`${blog.id}_title`] = blog.title;
          if (blog.summary) fieldsToTranslate[`${blog.id}_summary`] = blog.summary;
        });

        if (Object.keys(fieldsToTranslate).length > 0) {
          const translatedFields = await translationApi.translateBatch(fieldsToTranslate, language);
          page.content = page.content.map((blog) => ({
            ...blog,
            title: translatedFields[`${blog.id}_title`] || blog.title,
            summary: translatedFields[`${blog.id}_summary`] || blog.summary,
          }));
        }
      }

      return page;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.last) return undefined;
      return lastPage.number + 1;
    },
  });
}
