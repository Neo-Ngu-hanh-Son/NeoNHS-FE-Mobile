import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { blogService } from '../services/blogService';
import type { BlogResponse } from '../types';

export function useBlogDetail(blogId: string | number) {
  return useTranslatedQuery<BlogResponse>({
    queryKey: ['blog-detail', blogId],
    queryFn: async () => {
      const response = await blogService.getBlogById(blogId);
      return response.data;
    },
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {
        title: data.title,
      };

      if (data.summary) {
        fields.summary = data.summary;
      }

      if (data.contentHTML) {
        fields.contentHTML = data.contentHTML;
      }

      if (data.blogCategory?.name) {
        fields.blogCategoryName = data.blogCategory.name;
      }

      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      return {
        ...data,
        title: translated.title || data.title,
        summary: translated.summary || data.summary,
        contentHTML: translated.contentHTML || data.contentHTML,
        ...(data.blogCategory && translated.blogCategoryName
          ? {
              blogCategory: {
                ...data.blogCategory,
                name: translated.blogCategoryName,
              },
            }
          : {}),
      };
    },
    enabled: !!blogId,
  });
}
