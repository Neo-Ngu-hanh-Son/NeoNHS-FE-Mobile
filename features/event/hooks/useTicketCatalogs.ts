import { useTranslatedQuery } from '@/hooks/useTranslatedQuery';
import { eventService } from '../services/eventService';
import type { TicketCatalogResponse } from '../types';

export function useTicketCatalogs(eventId: string, enabled = true) {
  return useTranslatedQuery<TicketCatalogResponse[]>({
    queryKey: ['ticket-catalogs', eventId],
    queryFn: async () => {
      const response = await eventService.getTicketCatalogs(eventId);
      return response.data;
    },
    enabled: !!eventId && enabled,
    extractTranslatableFields: (data) => {
      const fields: Record<string, string> = {};
      data.forEach((item, idx) => {
        if (item.name) fields[`item_${idx}_name`] = item.name;
        if (item.description) fields[`item_${idx}_description`] = item.description;
        if (item.customerType) fields[`item_${idx}_customerType`] = item.customerType;
      });
      return fields;
    },
    mergeTranslatedFields: (data, translated) => {
      return data.map((item, idx) => ({
        ...item,
        name: translated[`item_${idx}_name`] ?? item.name,
        description: translated[`item_${idx}_description`] ?? item.description,
        customerType: translated[`item_${idx}_customerType`] ?? item.customerType,
      }));
    },
  });
}
