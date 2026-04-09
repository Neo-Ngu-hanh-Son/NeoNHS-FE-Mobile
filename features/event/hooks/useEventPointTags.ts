import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { eventService } from '../services/eventService';
import type { EventPointTagResponse, EventTimelineGroupResponse } from '../types';
import { deriveEventPointTagsFromGroups, normalizeEventPointTags } from '../utils/helpers';
import { logger } from '@/utils/logger';

export function useEventPointTags(eventId: string, fallbackGroups: EventTimelineGroupResponse[] = []) {
  const query = useQuery({
    queryKey: ['event-point-tags', eventId],
    queryFn: async () => {
      try {
        const response = await eventService.getEventPointTags(eventId);
        return normalizeEventPointTags(response.data);
      } catch (error) {
        logger.warn('[useEventPointTags] Falling back to timeline-derived tags', error);
        return [] as EventPointTagResponse[];
      }
    },
    enabled: !!eventId,
  });

  const data = useMemo(() => {
    if (query.data && query.data.length > 0) {
      return query.data;
    }

    return deriveEventPointTagsFromGroups(fallbackGroups);
  }, [fallbackGroups, query.data]);

  return {
    ...query,
    data,
  };
}
