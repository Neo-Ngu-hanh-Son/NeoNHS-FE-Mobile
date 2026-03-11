import { useQuery } from '@tanstack/react-query';
import { workshopService } from '../services/workshopService';

/**
 * Fetch all workshop tags (GET /api/wtags/all).
 * Tags are relatively static so we use a 5-minute staleTime.
 */
export function useWorkshopTags() {
  return useQuery({
    queryKey: ['workshop-tags'],
    queryFn: async () => {
      const response = await workshopService.getAllTags();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
