import { useQuery } from '@tanstack/react-query';
import { workshopService } from '../services/workshopService';

export function useWorkshopSessions(workshopId: string, enabled = true) {
  return useQuery({
    queryKey: ['workshop-sessions', workshopId],
    queryFn: async () => {
      const response = await workshopService.getSessions(workshopId);
      return response.data.content;
    },
    enabled: !!workshopId && enabled,
  });
}
