import { useState } from 'react';
import { homeService } from '../services/homeService';
import { BlogResponse } from '@/features/blog';
import { logger } from '@/utils/logger';

export default function useFeaturedBlog() {
  const [loading, setLoading] = useState(true);
  const [featuredBlog, setFeaturedBLog] = useState<BlogResponse | null>(null);

  const fetchfeaturedBlog = async () => {
    setLoading(true);
    try {
      const result = await homeService.getFeatured();
      if (result.content.length > 0) {
        setFeaturedBLog(result.content[0]);
      } else {
        throw new Error('No featured blog found');
      }
    } catch (error) {
      logger.error('Error fetching featuredBlog:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    featuredBlog,
    fetchfeaturedBlog,
  };
}
