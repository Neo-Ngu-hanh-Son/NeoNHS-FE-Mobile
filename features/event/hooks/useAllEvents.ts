import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { eventService } from '../services/eventService';
import type { EventResponse } from '../types';

export function useAllEvents() {
  return useTranslatedQuery<EventResponse[]>({
    queryKey: ['all-events'],
    queryFn: async () => {
      const response = await eventService.getAllEvents();
      return response.data;
    },
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.forEach((item, idx) => {
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
      return data.map((item, idx) => {
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
    },
  });
}
