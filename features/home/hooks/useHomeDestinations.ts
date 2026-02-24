import { useState } from 'react';
import { homeService } from '../services/homeService';
import { BlogResponse } from '@/features/blog';
import { logger } from '@/utils/logger';
import { MapPoint } from '@/features/map';

export default function useHomeDestinations() {
  const [loading, setLoading] = useState(true);
  const [destinations, setDestinations] = useState<MapPoint[]>([]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const result = await homeService.getDestinations();
      setDestinations(result.data.content);
    } catch (error) {
      logger.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    destinations,
    fetchDestinations,
  };
}
