import { homeService } from '../services/homeService';
import { useQuery } from '@tanstack/react-query';

export default function useGuides() {
  return useQuery({
    queryKey: ['home-guides'],
    queryFn: async () => {
      const result = await homeService.getKnowBeforeYouGo();
      return result.content;
    },
  });
}
