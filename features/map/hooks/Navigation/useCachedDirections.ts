import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LatLng } from 'react-native-maps';
import { mapDirectionService } from '../../services/mapDirectionService';
import { MapDirectionSource, RouteResponse, TravelMode } from '../../types';
import { customMapDirectionService } from '../../services/customMapService';
import { ThuySonMapData } from '../../data/ThuySonMapData';
import { ManualMapEdge } from '../../manualMapTypes';
import { thuySonMapGraph } from '../../data/ThuySonNodesAndAdjList';
import { logger } from '@/utils/logger';

const DIRECTIONS_CACHE_STALE_TIME_MS = 1000 * 60 * 20;
const DIRECTIONS_CACHE_GC_TIME_MS = 1000 * 60 * 60 * 6;
const COORDINATE_ROUND_DIGITS = 5;

export type DirectionsCacheParams = {
  origin: LatLng;
  destination: LatLng;
  travelMode: TravelMode;
  source: MapDirectionSource;
};

const toCoordinateKey = ({ latitude, longitude }: LatLng): string => {
  return `${latitude.toFixed(COORDINATE_ROUND_DIGITS)}:${longitude.toFixed(COORDINATE_ROUND_DIGITS)}`;
};

export const buildDirectionsQueryKey = ({ origin, destination, travelMode, source }: DirectionsCacheParams) => {
  return ['map-directions', toCoordinateKey(origin), toCoordinateKey(destination), travelMode, source] as const;
};

export const buildDirectionsQueryOptions = (params: DirectionsCacheParams) => {
  return {
    queryKey: buildDirectionsQueryKey(params),
    queryFn: async (): Promise<RouteResponse> => {
      const response = await mapDirectionService.getDirections(params.origin, params.destination, params.travelMode);

      return response.data;
    },
    staleTime: DIRECTIONS_CACHE_STALE_TIME_MS,
    gcTime: DIRECTIONS_CACHE_GC_TIME_MS,
  };
};

/**
 * Get the directions for preview (and for navigation as well)
 *
 * ONly pass the edges if you know what you are doing.
 */
export function useDirectionsPreview(
  params: DirectionsCacheParams | null,
  enabled: boolean,
  source: MapDirectionSource = MapDirectionSource.GOOGLE,
  edges?: ManualMapEdge[]
) {
  return useQuery({
    queryKey: params ? buildDirectionsQueryKey(params) : ['map-directions', 'disabled'],
    queryFn: async (): Promise<RouteResponse> => {
      logger.info('[useCachedDirections] Fetching directions for preview');
      if (!params) {
        throw new Error('Directions preview requires origin and destination.');
      }
      if (source === MapDirectionSource.CUSTOM) {
        logger.info('[useCachedDirections] Using custom map directions');
        const response = await customMapDirectionService.getDirections(
          params.origin,
          params.destination,
          params.travelMode,
          thuySonMapGraph
        );
        return response;
      } else {
        logger.info('[useCachedDirections] Using google map directions');
        const response = await mapDirectionService.getDirections(params.origin, params.destination, params.travelMode);
        return response.data;
      }
    },
    staleTime: DIRECTIONS_CACHE_STALE_TIME_MS,
    gcTime: DIRECTIONS_CACHE_GC_TIME_MS,
    enabled: enabled && !!params,
    placeholderData: (prev) => prev,
  });
}

export function useDirectionsCacheClient() {
  const queryClient = useQueryClient();

  /**
   * Get the queries of the direction from cache if have (Fetched above)
   */
  const fetchDirectionsWithCache = useCallback(
    (params: DirectionsCacheParams) => {
      return queryClient.fetchQuery(buildDirectionsQueryOptions(params));
    },
    [queryClient]
  );

  const getCachedDirections = useCallback(
    (params: DirectionsCacheParams) => {
      return queryClient.getQueryData<RouteResponse>(buildDirectionsQueryKey(params)) ?? null;
    },
    [queryClient]
  );

  return {
    fetchDirectionsWithCache,
    getCachedDirections,
  };
}
