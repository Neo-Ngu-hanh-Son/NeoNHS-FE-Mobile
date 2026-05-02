import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LatLng } from 'react-native-maps';
import { mapDirectionService } from '../../services/mapDirectionService';
import { DirectionsCacheParams, MapDirectionSource, RouteResponse, TravelMode } from '../../types';
import { customMapDirectionService } from '../../services/customMapService';
import { ThuySonMapData } from '../../data/ThuySonMapData';
import { ManualMapEdge } from '../../manualMapTypes';
import { thuySonMapGraph } from '../../data/ThuySonNodesAndAdjList';
import { logger } from '@/utils/logger';

const DIRECTIONS_CACHE_STALE_TIME_MS = 1000 * 60 * 20;
const DIRECTIONS_CACHE_GC_TIME_MS = 1000 * 60 * 60 * 6;
const COORDINATE_ROUND_DIGITS = 5;

const toCoordinateKey = ({ latitude, longitude }: LatLng): string => {
  return `${latitude.toFixed(COORDINATE_ROUND_DIGITS)}:${longitude.toFixed(COORDINATE_ROUND_DIGITS)}`;
};

export const buildDirectionsQueryKey = (params: DirectionsCacheParams) => {
  return [
    'map-directions',
    toCoordinateKey(params.origin ?? { latitude: 0, longitude: 0 }),
    toCoordinateKey(params.destination ?? { latitude: 0, longitude: 0 }),
    params.travelMode,
    params.source,
  ] as const;
};

/**
 * Get the directions for preview (and for navigation as well)
 */
export function useDirectionsPreview(
  params: DirectionsCacheParams | null,
  enabled: boolean,
  source: MapDirectionSource = MapDirectionSource.GOOGLE,
  language?: string
) {
  return useQuery({
    queryKey: params ? buildDirectionsQueryKey(params) : ['map-directions', 'disabled'],
    queryFn: async (): Promise<RouteResponse> => {
      logger.info('[useCachedDirections] Fetching directions for preview with language', language);
      if (!params) {
        throw new Error('Directions preview requires origin and destination.');
      }
      if (!params.origin || !params.destination) {
        throw new Error('Directions preview requires origin and destination.');
      }
      if (source === MapDirectionSource.CUSTOM) {
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
          language
        );
        return response.data;
      }
    },
    staleTime: DIRECTIONS_CACHE_STALE_TIME_MS,
    gcTime: DIRECTIONS_CACHE_GC_TIME_MS,
    enabled: enabled && !!params,
    placeholderData: (prev) => prev,
  });
}
