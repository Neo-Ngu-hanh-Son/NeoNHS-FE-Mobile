import { useQuery } from '@tanstack/react-query';
import { workshopService } from '../services/workshopService';
import type { WorkshopFilterParams } from '../types';

export function useWorkshopTemplates(params?: WorkshopFilterParams) {
  return useQuery({
    queryKey: ['workshop-templates', params],
    queryFn: async () => {
      const response = await workshopService.getTemplates(params);
      return response.data;
    },
  });
}
