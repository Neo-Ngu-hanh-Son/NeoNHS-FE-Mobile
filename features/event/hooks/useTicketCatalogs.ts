import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

export function useTicketCatalogs(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ['ticket-catalogs', eventId],
    queryFn: async () => {
      const response = await eventService.getTicketCatalogs(eventId);
      return response.data;
    },
    enabled: !!eventId && enabled,
  });
}
