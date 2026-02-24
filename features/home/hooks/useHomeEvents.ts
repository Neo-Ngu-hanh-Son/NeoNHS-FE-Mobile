import { useState } from 'react';
import { homeService } from '../services/homeService';
import { BlogResponse } from '@/features/blog';
import { logger } from '@/utils/logger';
import { EventResponse } from '@/features/event/types';

export default function useHomeEvents() {
  const [loading, setLoading] = useState(true);
  const [homeEvents, setHomeEvents] = useState<EventResponse[]>([]);

  const fetchHomeEvents = async () => {
    setLoading(true);
    try {
      const result = await homeService.getUpcomingEvents();
      setHomeEvents(result.data.content);
    } catch (error) {
      logger.error('Error fetching HomeEvents:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    homeEvents,
    fetchHomeEvents,
  };
}
