import { useQuery } from '@tanstack/react-query';
import { discoverService } from '../services/discoverServices';

export function usePointsByAttraction(attractionId?: string) {
  return useQuery({
    queryKey: ['points-by-attraction', attractionId],
    queryFn: async () => {
      const response = await discoverService.getPointsByAttraction(attractionId!);
      return response.data;
    },
    enabled: !!attractionId,
  });
}
