import { homeService } from '../services/homeService';
import { useQuery } from '@tanstack/react-query';

export default function useFeaturedBlog() {
  return useQuery({
    queryKey: ['home-featured-blog'],
    queryFn: async () => {
      // Use your existing get method
      const result = await homeService.getFeatured();
      if (result.content.length > 0) {
        return result.content[0];
      } else {
        throw new Error('No featured blog found');
      }
    },
  });
}
