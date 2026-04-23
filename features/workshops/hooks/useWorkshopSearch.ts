import { useInfiniteQuery } from '@tanstack/react-query';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';
import { workshopService } from '../services/workshopService';
import type { WorkshopSearchParams, WorkshopPageResponse, WorkshopTemplateResponse } from '../types';

/**
 * Infinite-scroll search hook for workshop templates.
 * Wraps GET /api/public/workshops/templates/search with useInfiniteQuery.
 */
export function useWorkshopSearch(params: Omit<WorkshopSearchParams, 'page'>) {
  const { language } = useLanguage();

  return useInfiniteQuery<WorkshopPageResponse<WorkshopTemplateResponse>>({
    queryKey: ['workshop-search', params, language],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await workshopService.searchTemplates({
        ...params,
        page: pageParam as number,
      });
      
      const data = response.data;
      if (language === 'vi') return data;
      
      // Translate the page content
      const fields: Record<string, string> = {};
      data.content.forEach((item, idx) => {
        if (item.name) fields[`item_${idx}_name`] = item.name;
        if (item.shortDescription) fields[`item_${idx}_shortDescription`] = item.shortDescription;
        if (item.vendorName) fields[`item_${idx}_vendorName`] = item.vendorName;
        
        item.tags?.forEach((tag, tagIdx) => {
          if (tag.name) fields[`item_${idx}_tag_${tagIdx}_name`] = tag.name;
        });
      });
      
      if (Object.keys(fields).length === 0) return data;
      
      const translated = await translationApi.translateBatch(fields, language);
      
      const mergedContent = data.content.map((item, idx) => {
        const mergedItem = {
          ...item,
          name: translated[`item_${idx}_name`] ?? item.name,
          shortDescription: translated[`item_${idx}_shortDescription`] ?? item.shortDescription,
          vendorName: translated[`item_${idx}_vendorName`] ?? item.vendorName,
        };
        
        if (item.tags) {
          mergedItem.tags = item.tags.map((tag, tagIdx) => ({
            ...tag,
            name: translated[`item_${idx}_tag_${tagIdx}_name`] ?? tag.name,
          }));
        }
        
        return mergedItem;
      });
      
      return {
        ...data,
        content: mergedContent,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.last) return undefined;
      return (lastPageParam as number) + 1;
    },
  });
}
