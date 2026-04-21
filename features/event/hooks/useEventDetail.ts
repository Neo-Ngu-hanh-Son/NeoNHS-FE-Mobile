import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { eventService } from '../services/eventService';
import type { EventResponse } from '../types';

export function useEventDetail(eventId: string) {
  return useTranslatedQuery<EventResponse>({
    queryKey: ['event-detail', eventId],
    queryFn: async () => {
      const response = await eventService.getEventById(eventId);
      return response.data;
    },
    enabled: !!eventId,
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      
      if (data.name) fields.name = data.name;
      if (data.shortDescription) fields.shortDescription = data.shortDescription;
      if (data.fullDescription) fields.fullDescription = data.fullDescription;
      if (data.locationName) fields.locationName = data.locationName;
      
      data.tags?.forEach((tag, idx) => {
        if (tag.name) fields[`tag_${idx}_name`] = tag.name;
        if (tag.description) fields[`tag_${idx}_description`] = tag.description;
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      const merged = {
        ...data,
        name: translated.name ?? data.name,
        shortDescription: translated.shortDescription ?? data.shortDescription,
        fullDescription: translated.fullDescription ?? data.fullDescription,
        locationName: translated.locationName ?? data.locationName,
      };
      
      if (data.tags && data.tags.length > 0) {
        merged.tags = data.tags.map((tag, idx) => ({
          ...tag,
          name: translated[`tag_${idx}_name`] ?? tag.name,
          description: translated[`tag_${idx}_description`] ?? tag.description,
        }));
      }
      
      return merged;
    },
  });
}
