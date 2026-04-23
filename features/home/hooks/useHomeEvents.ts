import { homeService } from '../services/homeService';
import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import type { EventResponse } from '@/features/event/types';

export default function useHomeEvents() {
  return useTranslatedQuery<EventResponse[]>({
    queryKey: ['home-events'],
    queryFn: async () => {
      const result = await homeService.getUpcomingEvents();
      return result.data.content;
    },
    extractTranslatableFields: (events) => {
      const fields: Record<string, string> = {};
      events.forEach(event => {
        if (event.name) fields[`event_${event.id}_name`] = event.name;
        if (event.shortDescription) fields[`event_${event.id}_description`] = event.shortDescription;
      });
      return fields;
    },
    mergeTranslatedFields: (events, translated) => {
      return events.map(event => ({
        ...event,
        name: translated[`event_${event.id}_name`] || event.name,
        description: translated[`event_${event.id}_description`] || event.shortDescription,
      }));
    }
  });
}
