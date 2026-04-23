import { QUERY_KEYS } from '@/services/api/tanstack/queryKeyConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import checkinServices from '../../services/checkinServices';
import { MapPoint, UserCheckinRequest } from '../..';
import { logger } from '@/utils/logger';

export const useCheckinMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserCheckinRequest) => checkinServices.userCheckIn(payload),

    onSuccess: (response, variables) => {
      const { checkinPointId } = variables;
      queryClient.setQueryData<MapPoint[]>([QUERY_KEYS.MAP_POINTS], (old = []) =>
        old.map((p) => {
          if (!p) {
            logger.warn('[useCheckinMutation] Encountered null map point in cache while updating check-in state');
            return p;
          }

          return {
            ...p,
            checkinPoints: p.checkinPoints?.map((cp) => {
              if (!cp) {
                logger.warn(`[useCheckinMutation] Encountered null check-in point in map point ${p.id}`);
                return cp;
              }

              logger.debug(`[useCheckinMutation] Checking check-in point ${cp.id} against target ${checkinPointId}`);

              if (!cp.id) {
                logger.error(`[useCheckinMutation] Invalid check-in point found in map point ${p.id}`);
                return cp;
              }
              if (cp.id === checkinPointId) {
                return {
                  ...cp,
                  isUserCheckedIn: true,
                };
              }
              return cp;
            }),
          };
        })
      );

      // No invalidates so that the UI can update immediately with the new check-in status without waiting for a refetch
      // queryClient.invalidateQueries({
      //   queryKey: [QUERY_KEYS.MAP_POINTS],
      // });
    },
  });
};
