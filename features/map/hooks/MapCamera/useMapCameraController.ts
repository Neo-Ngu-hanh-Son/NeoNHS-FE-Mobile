import { useEffect, RefObject, useCallback, useRef } from 'react';
import { LatLng } from 'react-native-maps';
import { NHSMapRef } from '@/features/map/components';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { MapPoint } from '../../types';
import { logger } from '@/utils/logger';

interface UseMapCameraControllerProps {
  mapRef: RefObject<NHSMapRef | null>;
  initialPointId?: string;
  targetNavigationPointId?: string;
  mapPoints: MapPoint[];
  navigationEndpoints?: { origin: LatLng; destination: LatLng } | null;
  isDirectionsReady: boolean;
  isGuidanceMode: boolean;
  handleOpenPointSheet: (point: MapPoint) => void;
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
  handleOpenPointSheet,
}: UseMapCameraControllerProps) => {
  const autoTriggerFocusRef = useRef(true);
  /**
   * This effect focus the camera to a specific point if user navigate it from the point details screen.
   */
  useEffect(() => {
    if (!initialPointId || mapPoints.length === 0) return;

    const targetPoint = mapPoints.find((p) => p.id === initialPointId);

    // logger.debug('Is map ready in camera controller?', isMapReady);
    if (targetPoint && autoTriggerFocusRef.current && mapRef.current) {
      handleOpenPointSheet(targetPoint);
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
      autoTriggerFocusRef.current = false; // Reset the ref after the initial focus attempt
    }
  }, [initialPointId, mapPoints, mapRef, handleOpenPointSheet]);

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

  // ================= Functions to programmatically control the camera =================

  const focusOnPoint = useCallback(
    (targetPoint: MapPoint) => {
      console.log('Focusing on point:', targetPoint.name);
      mapRef.current?.animateToCoordinate(
        {
          latitude: parseFloatOrDefault(targetPoint.latitude, 0),
          longitude: parseFloatOrDefault(targetPoint.longitude, 0),
          latDelta: 0.001,
          lngDelta: 0.001,
        },
        600
      );
    },
    [mapRef]
  );

  const fitCameraToCoordinates = useCallback(
    (origin: LatLng, destination: LatLng) => {
      mapRef.current?.fitToCoordinates(
        [origin, destination],
        {
          top: 160,
          right: 64,
          bottom: 180,
          left: 64,
        },
        true
      );
    },
    [mapRef]
  );

  return {
    focusOnPoint,
    fitCameraToCoordinates,
  };
};
