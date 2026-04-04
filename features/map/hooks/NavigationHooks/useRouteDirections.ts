import { parseFloatOrDefault } from '@/utils/parseNumber';
import { useEffect, useRef, useState } from 'react';
import { decodeRoutePolyline } from '../../helpers';
import { mapDirectionService } from '../../services/mapDirectionService';
import { logger } from '@/utils/logger';
import { MapPoint } from '@/features/map/types';

type UseRouteDirectionsReturn = {
  refreshRouteDirections: () => Promise<void>;
  error: string | null;
};

export const useRouteDirections = ({
  getDirectionsFetchContext,
  setRouteState,
  setNavigationStatus,
  mapPoints,
}: {
  getDirectionsFetchContext: () => { targetId: string; origin: MapPoint } | null;
  setRouteState: (state: any) => void;
  setNavigationStatus: (status: any) => void;
  mapPoints: MapPoint[];
}) => {
  const [error, setError] = useState<string | null>(null);
  const fetchedNavigationTargetRef = useRef<string | null>(null);
  const directionsInFlightTargetRef = useRef<string | null>(null);

  useEffect(() => {
    const directionsFetchContext = getDirectionsFetchContext();
    if (!directionsFetchContext) {
      return;
    }

    const { targetId, origin } = directionsFetchContext;

    if (fetchedNavigationTargetRef.current === targetId) {
      return;
    }
    if (directionsInFlightTargetRef.current === targetId) {
      return;
    }

    const targetPoint = mapPoints.find((point) => point.id === targetId);
    if (!targetPoint) {
      logger.warn('[useMapNavigationGuidance] Navigation target point not found for id:', targetId);
      return;
    }

    const destination = {
      latitude: parseFloatOrDefault(targetPoint.latitude, NaN),
      longitude: parseFloatOrDefault(targetPoint.longitude, NaN),
    };

    if (!Number.isFinite(destination.latitude) || !Number.isFinite(destination.longitude)) {
      logger.error('[useMapNavigationGuidance] Invalid destination coordinates', {
        pointId: targetPoint.id,
        latitude: targetPoint.latitude,
        longitude: targetPoint.longitude,
      });
      return;
    }

    let isCancelled = false;

    const fetchDirections = async () => {
      directionsInFlightTargetRef.current = targetId;

      try {
        const response = await mapDirectionService.getDirections(origin, destination, 'WALK');

        const leg = response.data.routes?.[0]?.legs?.[0];
        const encodedPolyline = response.data.routes?.[0]?.polyline?.encodedPolyline;
        const decodedCoordinates = encodedPolyline ? decodeRoutePolyline(encodedPolyline) : [];

        const startLatLng = leg?.startLocation?.latLng;
        const endLatLng = leg?.endLocation?.latLng;
        const routeOrigin = {
          latitude: startLatLng?.latitude ?? origin.latitude,
          longitude: startLatLng?.longitude ?? origin.longitude,
        };
        const endPoint = {
          latitude: endLatLng?.latitude ?? destination.latitude,
          longitude: endLatLng?.longitude ?? destination.longitude,
        };

        if (!encodedPolyline || decodedCoordinates.length === 0) {
          logger.warn('[useMapNavigationGuidance] Empty route data returned from directions API', {
            targetNavigationPointId: targetId,
          });
        }

        if (!isCancelled) {
          const nextSteps = leg?.steps ?? [];
          setRouteState({
            routeSummary: response.data,
            steps: nextSteps,
            navigationPolylineCoordinates: decodedCoordinates,
            navigationEndpoints: {
              origin: routeOrigin,
              destination: endPoint,
            },
          });

          fetchedNavigationTargetRef.current = targetId;
        }
      } catch (error) {
        logger.error('[useMapNavigationGuidance] Failed to fetch navigation directions', error);
        setError('Failed to load directions. Please try again.');
      } finally {
        if (directionsInFlightTargetRef.current === targetId) {
          directionsInFlightTargetRef.current = null;
        }
      }
    };

    fetchDirections();

    return () => {
      isCancelled = true;
    };
  }, [getDirectionsFetchContext, mapPoints, alert]);

  return { error };
};
