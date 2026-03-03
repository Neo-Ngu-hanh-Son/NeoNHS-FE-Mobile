import { homeService } from '../services/homeService';
import { useQuery } from '@tanstack/react-query';

export default function useHomeEvents() {
  return useQuery({
    queryKey: ['home-events'],
    queryFn: async () => {
      const result = await homeService.getUpcomingEvents();
      return result.data.content;
    },
  });
}
