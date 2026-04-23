import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { blogService } from '../services/blogService';
import type { BlogResponse } from '../types';
import { useRef } from 'react';

export function useBlogDetail(blogId: string | number) {
  const urlMapRef = useRef<Record<string, string>>({});

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
        urlMapRef.current = {};
        let idCounter = 0;
        fields.contentHTML = data.contentHTML.replace(/src=["']([^"']+)["']/gi, (match, url) => {
          const placeholder = `__URL_${idCounter++}__`;
          urlMapRef.current[placeholder] = url;
          return `src="${placeholder}"`;
        });
      }

      if (data.blogCategory?.name) {
        fields.blogCategoryName = data.blogCategory.name;
      }

      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      let finalHtml = translated.contentHTML || data.contentHTML;
      
      if (finalHtml && translated.contentHTML) {
        // Khôi phục URL từ placeholder vì NLLB có thể làm hỏng định dạng src nếu không bảo vệ
        Object.entries(urlMapRef.current).forEach(([placeholder, url]) => {
          finalHtml = finalHtml?.replace(placeholder, url);
        });
      }

      return {
        ...data,
        title: translated.title || data.title,
        summary: translated.summary || data.summary,
        contentHTML: finalHtml,
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
