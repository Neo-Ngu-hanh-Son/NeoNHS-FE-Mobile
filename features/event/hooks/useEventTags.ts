import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { eventService } from '../services/eventService';
import type { EventPointTagResponse } from '../types';

/**
 * Fetch all event tags (GET /api/tags).
 */
export function useEventTags() {
  return useTranslatedQuery<EventPointTagResponse[]>({
    queryKey: ['event-tags'],
    queryFn: async () => {
      const response = await eventService.getEventTags();
      return response.data;
    },
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.forEach((tag, idx) => {
        if (tag.name) fields[`tag_${idx}_name`] = tag.name;
        if (tag.description) fields[`tag_${idx}_description`] = tag.description;
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      return data.map((tag, idx) => ({
        ...tag,
        name: translated[`tag_${idx}_name`] ?? tag.name,
        description: translated[`tag_${idx}_description`] ?? tag.description,
      }));
    },
  });
}
