import { QUERY_KEYS } from '@/services/api/tanstack/queryKeyConstants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import checkinServices from '../../services/checkinServices';
import { MapPoint, UserCheckinRequest } from '../..';

export const useCheckinMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserCheckinRequest) => checkinServices.userCheckIn(payload),

    onSuccess: (response, variables) => {
      const { checkinPointId } = variables;

      queryClient.setQueryData<MapPoint[]>([QUERY_KEYS.MAP_POINTS], (old = []) =>
        old.map((p) => ({
          ...p,
          checkinPoints: p.checkinPoints?.map((cp) =>
            cp.id === checkinPointId ? { ...cp, isUserCheckedIn: true } : cp
          ),
        }))
      );

      // No invalidates so that the UI can update immediately with the new check-in status without waiting for a refetch
      // queryClient.invalidateQueries({
      //   queryKey: [QUERY_KEYS.MAP_POINTS],
      // });
    },
  });
};
