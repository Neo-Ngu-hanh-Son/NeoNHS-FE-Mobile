import { useQuery } from '@tanstack/react-query';
import { discoverService } from '../services/discoverServices';

export function useAttractions(search: string) {
  return useQuery({
    queryKey: ['attractions', search],
    queryFn: async () => {
      const response = await discoverService.getAllAttractionsWithPointPaginated({
        search: search,
        page: 0,
        size: 100,
        sortBy: 'id',
        sortDir: 'asc'
      });
      return response.data.content;
    },
    enabled: true,
  });
}
