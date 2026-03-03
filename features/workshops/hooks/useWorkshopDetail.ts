import { useQuery } from '@tanstack/react-query';
import { workshopService } from '../services/workshopService';

export function useWorkshopDetail(workshopId: string) {
  return useQuery({
    queryKey: ['workshop-detail', workshopId],
    queryFn: async () => {
      const response = await workshopService.getTemplateById(workshopId);
      return response.data;
    },
    enabled: !!workshopId,
  });
}
