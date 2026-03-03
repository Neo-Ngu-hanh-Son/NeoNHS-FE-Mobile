import { useQuery } from '@tanstack/react-query';
import { discoverService } from '../services/discoverServices';

export function useAttractions() {
  return useQuery({
    queryKey: ['attractions'],
    queryFn: async () => {
      const response = await discoverService.getAllAttractions();
      return response.data;
    },
  });
}
