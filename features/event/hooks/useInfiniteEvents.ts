import { useInfiniteQuery } from '@tanstack/react-query';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';
import { eventService } from '../services/eventService';
import type { EventFilterParams, PageResponse, EventResponse } from '../types';

/**
 * Infinite-scroll search hook for events.
 * Wraps GET /api/events with useInfiniteQuery.
 */
export function useInfiniteEvents(params: Omit<EventFilterParams, 'page'>) {
  const { language } = useLanguage();

  return useInfiniteQuery<PageResponse<EventResponse>>({
    queryKey: ['events-infinite', params, language],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await eventService.getEvents({
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
        if (item.locationName) fields[`item_${idx}_locationName`] = item.locationName;
        
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
          locationName: translated[`item_${idx}_locationName`] ?? item.locationName,
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
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.last) return undefined;
      return (lastPageParam as number) + 1;
    },
  });
}
