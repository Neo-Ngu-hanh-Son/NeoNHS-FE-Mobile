import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

export function useEventDetail(eventId: string) {
  return useQuery({
    queryKey: ['event-detail', eventId],
    queryFn: async () => {
      const response = await eventService.getEventById(eventId);
      return response.data;
    },
    enabled: !!eventId,
  });
}
