import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

export function useAllEvents() {
  return useQuery({
    queryKey: ['all-events'],
    queryFn: async () => {
      const response = await eventService.getAllEvents();
      return response.data;
    },
  });
}
