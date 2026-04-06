import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LatLng } from 'react-native-maps';
import { mapDirectionService } from '../services/mapDirectionService';
import { RouteResponse, TravelMode } from '../types';

const DIRECTIONS_CACHE_STALE_TIME_MS = 1000 * 60 * 20;
const DIRECTIONS_CACHE_GC_TIME_MS = 1000 * 60 * 60 * 6;
const COORDINATE_ROUND_DIGITS = 5;

export type DirectionsCacheParams = {
  origin: LatLng;
  destination: LatLng;
  travelMode: TravelMode;
};

const toCoordinateKey = ({ latitude, longitude }: LatLng): string => {
  return `${latitude.toFixed(COORDINATE_ROUND_DIGITS)}:${longitude.toFixed(COORDINATE_ROUND_DIGITS)}`;
};

export const buildDirectionsQueryKey = ({ origin, destination, travelMode }: DirectionsCacheParams) => {
  return ['map-directions', toCoordinateKey(origin), toCoordinateKey(destination), travelMode] as const;
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
 */
export function useDirectionsPreview(params: DirectionsCacheParams | null, enabled: boolean) {
  return useQuery({
    queryKey: params ? buildDirectionsQueryKey(params) : ['map-directions', 'preview-disabled'],
    queryFn: async (): Promise<RouteResponse> => {
      if (!params) {
        throw new Error('Directions preview requires origin and destination.');
      }

      const response = await mapDirectionService.getDirections(params.origin, params.destination, params.travelMode);

      return response.data;
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
