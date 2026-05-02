import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';

export function useReviewEligibility(
  targetId: string,
  flag: 'WORKSHOP' | 'EVENT' | 'POINT',
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['review-eligibility', targetId, flag],
    queryFn: async () => {
      // Assuming reviewService handles the API call
      // We will define checkEligibility in reviewService
      return await reviewService.checkEligibility(targetId, flag);
    },
    enabled: options?.enabled,
  });
}
