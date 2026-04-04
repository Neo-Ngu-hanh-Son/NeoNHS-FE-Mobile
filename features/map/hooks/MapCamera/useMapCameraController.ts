import { useEffect, RefObject, useState } from 'react';
import { LatLng } from 'react-native-maps';
import { NHSMapRef } from '@/features/map/components';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { MapPoint } from '../../types';

interface UseMapCameraControllerProps {
  mapRef: RefObject<NHSMapRef | null>;
  initialPointId?: string;
  targetNavigationPointId?: string;
  mapPoints: MapPoint[];
  navigationEndpoints?: { origin: LatLng; destination: LatLng } | null;
  isDirectionsReady: boolean;
  isGuidanceMode: boolean;
}

/**
 * This hook manages the map camera behavior for the MapScreen, including:
 * 1. Auto-focusing on a specific point when the screen loads with an initialPointId.
 * 2. Automatically fitting the map view to the navigation route when in guidance mode and directions are ready.
 *
 * It returns the currently focused point (if any) that triggered the camera movement, which can be used by the parent component to set the selected point and open the details modal.
 */
export const useMapCameraController = ({
  mapRef,
  initialPointId,
  targetNavigationPointId,
  mapPoints,
  navigationEndpoints,
  isDirectionsReady,
  isGuidanceMode,
}: UseMapCameraControllerProps) => {
  const [focusedPoint, setFocusedPoint] = useState<MapPoint | null>(null);

  useEffect(() => {
    if (!initialPointId || mapPoints.length === 0) return;

    const targetPoint = mapPoints.find((p) => p.id === initialPointId);

    if (targetPoint) {
      // logger.info('[MapScreen] Auto-focusing on point:', targetPoint.name);
      setTimeout(() => {
        mapRef.current?.animateToCoordinate(
          {
            latitude: parseFloatOrDefault(targetPoint.latitude, 0),
            longitude: parseFloatOrDefault(targetPoint.longitude, 0),
            latDelta: 0.001,
            lngDelta: 0.001,
          },
          600
        );
      }, 500);
      // Set state and return in to the parent
      setFocusedPoint(targetPoint);
    }
  }, [initialPointId, mapPoints, mapRef]);

  // 2. Handle Route Fitting (Auto, no need to trigger any states)
  useEffect(() => {
    if (!isGuidanceMode || !targetNavigationPointId || !isDirectionsReady || !navigationEndpoints) {
      return;
    }

    mapRef.current?.fitToCoordinates(
      [navigationEndpoints.origin, navigationEndpoints.destination],
      {
        top: 160,
        right: 64,
        bottom: 180,
        left: 64,
      },
      true
    );
  }, [isGuidanceMode, targetNavigationPointId, isDirectionsReady, navigationEndpoints, mapRef]);

  return {
    focusedPoint,
  };
};
