import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';
import type { EventFilterParams } from '../types';

export function useEvents(params?: EventFilterParams) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: async () => {
      const response = await eventService.getEvents(params);
      return response.data;
    },
  });
}
