import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';
import type { EventTimelinesGroupedParams } from '../types';
import { normalizeEventTimelineGroups } from '../utils/helpers';

export function useEventTimelinesGrouped(
  eventId: string,
  params?: EventTimelinesGroupedParams,
  enabled = true
) {
  return useQuery({
    queryKey: ['event-timelines-grouped', eventId, params],
    queryFn: async () => {
      const response = await eventService.getEventTimelinesGrouped(eventId, params);
      return normalizeEventTimelineGroups(response.data);
    },
    enabled: !!eventId && enabled,
  });
}
