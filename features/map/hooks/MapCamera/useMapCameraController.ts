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
  navigationEndpoints?: { origin?: LatLng; destination?: LatLng } | null;
  handleOpenPointSheet: (point: MapPoint) => void;
  isMapReady: boolean;
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
  mapPoints,
  navigationEndpoints,
  handleOpenPointSheet,
  isMapReady,
}: UseMapCameraControllerProps) => {
  const autoTriggerFocusRef = useRef(true);
  const initialFocusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * This effect focus the camera to a specific point if user navigate it from the point details screen.
   */
  useEffect(() => {
    if (!initialPointId || mapPoints.length === 0) return;

    const targetPoint = mapPoints.find((p) => p.id === initialPointId);

    // logger.debug('Is map ready in camera controller?', isMapReady);
    if (targetPoint && autoTriggerFocusRef.current && mapRef.current && isMapReady) {
      handleOpenPointSheet(targetPoint);
      initialFocusTimeoutRef.current = setTimeout(() => {
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

    return () => {
      if (initialFocusTimeoutRef.current) {
        clearTimeout(initialFocusTimeoutRef.current);
        initialFocusTimeoutRef.current = null;
      }
    };
  }, [initialPointId, mapPoints, mapRef, handleOpenPointSheet, isMapReady]);

  /**
   * This effect fit the camera to the navigation preview route when it is first mounted
   */

  const initialRouteFocusRef = useRef(false);
  useEffect(() => {
    console.log('Auto focus statuses', {
      navigationEndpoints,
      isMapReady,
      mapRefReady: !!mapRef.current,
      initialRouteFocusSet: !!initialRouteFocusRef.current,
    });
    if (
      navigationEndpoints == null ||
      !navigationEndpoints.origin ||
      !navigationEndpoints.destination ||
      initialRouteFocusRef.current ||
      !isMapReady
    ) {
      return;
    }
    logger.debug('Fitting camera to navigation route for the first time');
    mapRef.current?.fitToCoordinates(
      [navigationEndpoints.origin, navigationEndpoints.destination],
      {
        top: 160,
        right: 64,
        bottom: 360,
        left: 64,
      },
      true
    );
    initialRouteFocusRef.current = true;
  }, [navigationEndpoints, isMapReady, mapRef]);

  // ================= Functions to programmatically control the camera =================

  const focusOnPoint = useCallback(
    (targetPoint: MapPoint) => {
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
