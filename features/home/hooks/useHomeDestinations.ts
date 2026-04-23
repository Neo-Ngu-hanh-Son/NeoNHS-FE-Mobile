import { homeService } from '../services/homeService';
import { useQuery } from '@tanstack/react-query';

export default function useHomeDestinations() {
  return useQuery({
    queryKey: ['home-destinations'],
    queryFn: async () => {
      const result = await homeService.getDestinations();
      return result.data.content;
    },
  });
}
