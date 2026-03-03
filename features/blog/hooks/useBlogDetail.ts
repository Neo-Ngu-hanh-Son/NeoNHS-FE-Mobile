import { useQuery } from '@tanstack/react-query';
import { blogService } from '../services/blogService';

export function useBlogDetail(blogId: string | number) {
  return useQuery({
    queryKey: ['blog-detail', blogId],
    queryFn: async () => {
      const response = await blogService.getBlogById(blogId);
      return response.data;
    },
    enabled: !!blogId,
  });
}
