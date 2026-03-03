import { homeService } from '../services/homeService';
import { useQuery } from '@tanstack/react-query';

export default function useOverviews() {
  return useQuery({
    queryKey: ['home-overviews'],
    queryFn: async () => {
      const result = await homeService.getAboutNHS();
      return result.content;
    },
  });
}
