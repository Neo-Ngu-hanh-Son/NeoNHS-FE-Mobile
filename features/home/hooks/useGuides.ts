import { useState } from 'react';
import { homeService } from '../services/homeService';
import { BlogResponse } from '@/features/blog';
import { logger } from '@/utils/logger';

export default function useGuides() {
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<BlogResponse[]>([]);

  const fetchGuides = async () => {
    setLoading(true);
    try {
      const result = await homeService.getKnowBeforeYouGo();
      setGuides(result.content);
    } catch (error) {
      logger.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    guides,
    fetchGuides,
  };
}
