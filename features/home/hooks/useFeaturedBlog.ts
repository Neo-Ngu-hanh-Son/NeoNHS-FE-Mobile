import { homeService } from '../services/homeService';
import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import type { BlogResponse } from '@/features/blog/types';

export default function useFeaturedBlog() {
  return useTranslatedQuery<BlogResponse | null>({
    queryKey: ['home-featured-blog'],
    queryFn: async () => {
      const result = await homeService.getFeatured();
      return result.content[0] ?? null;
    },
    extractTranslatableFields: (blog) => {
      if (!blog) return {};
      const fields: Record<string, string> = {};
      if (blog.title) fields.title = blog.title;
      if (blog.summary) fields.summary = blog.summary;
      return fields;
    },
    mergeTranslatedFields: (blog, translated) => {
      if (!blog) return null;
      return {
        ...blog,
        title: translated.title || blog.title,
        summary: translated.summary || blog.summary,
      };
    }
  });
}
