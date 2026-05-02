import { useQuery } from '@tanstack/react-query';
import { MapDirectionSource, RouteResponse, UseDirectionsNavigationParams } from '../../types';
import { logger } from '@/utils/logger';
import { thuySonMapGraph } from '../../data/ThuySonNodesAndAdjList';
import { customMapDirectionService } from '../../services/customMapService';
import { mapDirectionService } from '../../services/mapDirectionService';

export function useDirectionsNavigation({ params, initialData, enabled, originKey }: UseDirectionsNavigationParams) {
  const queryKey = [
    'navigation-route',
    originKey?.latitude,
    originKey?.longitude,
    params.destination?.latitude,
    params.destination?.longitude,
    params.travelMode,
    params.source,
  ];

  return useQuery({
    queryKey: queryKey,
    queryFn: async (): Promise<RouteResponse> => {
      logger.info('[useDirectionsNavigation] Getting directions from ', params.source);
      if (!params.origin || !params.destination) {
        throw new Error('Directions preview requires origin and destination.');
      }
      if (params.source === MapDirectionSource.CUSTOM) {
        const response = await customMapDirectionService.getDirections(
          params.origin,
          params.destination,
          params.travelMode,
          thuySonMapGraph
        );
        return response;
      } else {
        const response = await mapDirectionService.getDirections(
          params.origin,
          params.destination,
          params.travelMode,
          params.language
        );
        return response.data;
      }
    },
    initialData,

    staleTime: 0, // always considered stale
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: enabled,
  });
}
