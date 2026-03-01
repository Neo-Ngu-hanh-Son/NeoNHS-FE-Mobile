import { useState } from 'react';
import { homeService } from '../services/homeService';
import { BlogResponse } from '@/features/blog';
import { logger } from '@/utils/logger';

export default function useOverviews() {
  const [loading, setLoading] = useState(true);
  const [overviews, setOverviews] = useState<BlogResponse[]>([]);

  const fetchOverviews = async () => {
    setLoading(true);
    try {
      const result = await homeService.getAboutNHS();
      setOverviews(result.content);
    } catch (error) {
      logger.error('Error fetching Overview:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    overviews,
    fetchOverviews,
  };
}
