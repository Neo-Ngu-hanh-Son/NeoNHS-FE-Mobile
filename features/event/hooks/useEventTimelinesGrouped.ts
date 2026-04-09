import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';
import { normalizeEventTimelineGroups } from '../utils/helpers';

export function useEventTimelinesGrouped(eventId: string, enabled = true) {
  return useQuery({
    queryKey: ['event-timelines-grouped', eventId],
    queryFn: async () => {
      const response = await eventService.getEventTimelinesGrouped(eventId);
      return normalizeEventTimelineGroups(response.data);
    },
    enabled: !!eventId && enabled,
  });
}
