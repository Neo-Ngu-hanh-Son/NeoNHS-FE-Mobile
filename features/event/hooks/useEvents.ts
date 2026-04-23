import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { eventService } from '../services/eventService';
import type { EventFilterParams, PageResponse, EventResponse } from '../types';

export function useEvents(params?: EventFilterParams) {
  return useTranslatedQuery<PageResponse<EventResponse>>({
    queryKey: ['events', params],
    queryFn: async () => {
      const response = await eventService.getEvents(params);
      return response.data;
    },
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.content.forEach((item, idx) => {
        if (item.name) fields[`item_${idx}_name`] = item.name;
        if (item.shortDescription) fields[`item_${idx}_shortDescription`] = item.shortDescription;
        if (item.fullDescription) fields[`item_${idx}_fullDescription`] = item.fullDescription;
        if (item.locationName) fields[`item_${idx}_locationName`] = item.locationName;
        
        item.tags?.forEach((tag, tagIdx) => {
          if (tag.name) fields[`item_${idx}_tag_${tagIdx}_name`] = tag.name;
        });
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      const mergedContent = data.content.map((item, idx) => {
        const mergedItem = {
          ...item,
          name: translated[`item_${idx}_name`] ?? item.name,
          shortDescription: translated[`item_${idx}_shortDescription`] ?? item.shortDescription,
          fullDescription: translated[`item_${idx}_fullDescription`] ?? item.fullDescription,
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
  });
}
