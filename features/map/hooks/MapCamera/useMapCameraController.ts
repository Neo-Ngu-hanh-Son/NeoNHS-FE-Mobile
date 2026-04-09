import { useEffect, RefObject, useCallback, useRef } from 'react';
import { LatLng } from 'react-native-maps';
import { NHSMapRef } from '@/features/map/components';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { MapPoint } from '../../types';

interface UseMapCameraControllerProps {
  mapRef: RefObject<NHSMapRef | null>;
  initialPointId?: string;
  targetNavigationPointId?: string;
  mapPoints: MapPoint[];
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

  // ================= Functions to programmatically control the camera =================

  /**
   * Focus the camera to a specific point
   */
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

  const fitCameraToAllLatLngPoints = useCallback(
    (points: LatLng[]) => {
      if (!isMapReady || !mapRef.current) {
        return;
      }

      const coordinates = points
        .map((point) => ({ latitude: point.latitude, longitude: point.longitude }))
        .filter(
          (coordinate) =>
            Number.isFinite(coordinate.latitude) &&
            Number.isFinite(coordinate.longitude) &&
            coordinate.latitude !== -1 &&
            coordinate.longitude !== -1
        );

      if (coordinates.length === 0) {
        return;
      }

      if (coordinates.length === 1) {
        mapRef.current.animateToCoordinate(
          {
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latDelta: 0.005,
            lngDelta: 0.005,
          },
          550
        );
        return;
      }

      mapRef.current.fitToCoordinates(coordinates, {
        top: 220,
        right: 64,
        bottom: 220,
        left: 64,
      });
    },
    [isMapReady, mapRef]
  );
  /**
   * Fit the camera of the map to the specific coordiantes
   *
   * Note: DOES NOT check if mapRef is available or not, you must check it yourself.
   */
  const fitCameraToCoordinates = useCallback(
    (origin: LatLng, destination: LatLng, options?: { top: number; right: number; bottom: number; left: number }) => {
      mapRef.current?.fitToCoordinates(
        [origin, destination],
        options ?? {
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
    fitCameraToAllLatLngPoints,
  };
};
