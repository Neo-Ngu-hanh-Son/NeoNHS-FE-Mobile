import { useMemo } from 'react';
import type { EventTimelineGroupResponse } from '../types';
import { deriveEventPointTagsFromGroups } from '../utils/helpers';

export function useEventPointTags(_eventId: string, fallbackGroups: EventTimelineGroupResponse[] = []) {
  const data = useMemo(() => {
    return deriveEventPointTagsFromGroups(fallbackGroups);
  }, [fallbackGroups]);

  return {
    data,
  };
}
