import { homeService } from '../services/homeService';
import { useQuery } from '@tanstack/react-query';

export default function useFeaturedBlog() {
  return useQuery({
    queryKey: ['home-featured-blog'],
    queryFn: async () => {
      const result = await homeService.getFeatured();
      return result.content[0] ?? null;
    },
  });
}
