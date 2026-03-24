import { useCallback, useEffect, useRef, useState } from 'react';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { logger } from '@/utils/logger';
import { mapDirectionService } from '../services/mapDirectionService';
import { decodeRoutePolyline } from '../helpers';
import { MapPoint, PolylineCoordinate } from '../types';
import type { LocationPermissionStatus, UserLocation } from './useUserLocation';

type RouteSummary = {
  durationText?: string;
  distanceText?: string;
} | null;

type UseMapNavigationGuidanceParams = {
  targetNavigationPointId?: string;
  mapPoints: MapPoint[];
  userLocation: UserLocation | null;
  permissionStatus: LocationPermissionStatus;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  alert: (title: string, message: string) => void;
  clearTargetNavigationParam: () => void;
};

type UseMapNavigationGuidanceReturn = {
  isGuidanceMode: boolean;
  isDirectionsLoading: boolean;
  isDirectionsReady: boolean;
  directionError: string | null;
  routeSummary: RouteSummary;
  navigationPolylineCoordinates: PolylineCoordinate[];
  onMapReady: () => void;
  handleExitGuidance: () => void;
  navigationEndpoints: {
    origin: PolylineCoordinate;
    destination: PolylineCoordinate;
  } | null;
};

export function useMapNavigationGuidance({
  targetNavigationPointId,
  mapPoints,
  userLocation,
  permissionStatus,
  isTracking,
  startTracking,
  alert,
  clearTargetNavigationParam,
}: UseMapNavigationGuidanceParams): UseMapNavigationGuidanceReturn {
  const [isMapReady, setIsMapReady] = useState(false);
  const [isGuidanceMode, setIsGuidanceMode] = useState(Boolean(targetNavigationPointId));
  const [isDirectionsLoading, setIsDirectionsLoading] = useState(false);
  const [isDirectionsReady, setIsDirectionsReady] = useState(false);
  const [directionError, setDirectionError] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary>(null);
  const [navigationPolylineCoordinates, setNavigationPolylineCoordinates] =
    useState<PolylineCoordinate[]>([]);
  const [navigationEndpoints, setNavigationEndpoints] = useState<{
    origin: PolylineCoordinate;
    destination: PolylineCoordinate;
  } | null>(null);

  const fetchedNavigationTargetRef = useRef<string | null>(null);
  const directionsInFlightTargetRef = useRef<string | null>(null);
  const missingTargetAlertedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!targetNavigationPointId) {
      setIsGuidanceMode(false);
      setNavigationPolylineCoordinates([]);
      setIsDirectionsLoading(false);
      setIsDirectionsReady(false);
      setDirectionError(null);
      setRouteSummary(null);
      setNavigationEndpoints(null);
      fetchedNavigationTargetRef.current = null;
      directionsInFlightTargetRef.current = null;
      missingTargetAlertedRef.current = null;
      return;
    }

    setIsGuidanceMode(true);
    fetchedNavigationTargetRef.current = null;
    directionsInFlightTargetRef.current = null;
    missingTargetAlertedRef.current = null;
    setNavigationPolylineCoordinates([]);
    setIsDirectionsLoading(false);
    setIsDirectionsReady(false);
    setDirectionError(null);
    setRouteSummary(null);
    setNavigationEndpoints(null);
  }, [targetNavigationPointId]);

  useEffect(() => {
    if (!isGuidanceMode) return;
    if (!targetNavigationPointId) return;
    if (permissionStatus !== 'granted') return;
    if (userLocation || isTracking) return;

    startTracking();
  }, [isGuidanceMode, targetNavigationPointId, permissionStatus, userLocation, isTracking, startTracking]);

  useEffect(() => {
    if (
      !isGuidanceMode ||
      !targetNavigationPointId ||
      !isMapReady ||
      !userLocation ||
      mapPoints.length === 0
    ) {
      return;
    }
    if (fetchedNavigationTargetRef.current === targetNavigationPointId) {
      return;
    }
    if (directionsInFlightTargetRef.current === targetNavigationPointId) {
      return;
    }

    const targetPoint = mapPoints.find((point) => point.id === targetNavigationPointId);
    if (!targetPoint) {
      logger.warn('[useMapNavigationGuidance] Navigation target point not found for id:', targetNavigationPointId);

      if (missingTargetAlertedRef.current !== targetNavigationPointId) {
        alert('Navigation Unavailable', 'Unable to find the destination point on the map.');
        missingTargetAlertedRef.current = targetNavigationPointId;
      }
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
      directionsInFlightTargetRef.current = targetNavigationPointId;
      setIsDirectionsLoading(true);
      setIsDirectionsReady(false);
      setDirectionError(null);

      try {
        const response = await mapDirectionService.getDirections(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          destination,
          'WALK'
        );

        const leg = response.data.routes?.[0]?.legs?.[0];
        const encodedPolyline = response.data.routes?.[0]?.polyline?.encodedPolyline;
        const decodedCoordinates = encodedPolyline ? decodeRoutePolyline(encodedPolyline) : [];

        const firstStepWithValues = leg?.steps?.find(
          (step) => step.localizedValues?.distance?.text || step.localizedValues?.staticDuration?.text
        );

        const startLatLng = leg?.startLocation?.latLng;
        const endLatLng = leg?.endLocation?.latLng;
        const origin = {
          latitude: startLatLng?.latitude ?? userLocation.latitude,
          longitude: startLatLng?.longitude ?? userLocation.longitude,
        };
        const endPoint = {
          latitude: endLatLng?.latitude ?? destination.latitude,
          longitude: endLatLng?.longitude ?? destination.longitude,
        };

        if (!encodedPolyline || decodedCoordinates.length === 0) {
          logger.warn('[useMapNavigationGuidance] Empty route data returned from directions API', {
            targetNavigationPointId,
          });

          if (!isCancelled) {
            setDirectionError('Unable to build a route for this destination right now.');
          }
        }

        if (!isCancelled) {
          setNavigationPolylineCoordinates(decodedCoordinates);
          setNavigationEndpoints({
            origin,
            destination: endPoint,
          });
          setRouteSummary({
            distanceText: firstStepWithValues?.localizedValues?.distance?.text,
            durationText: firstStepWithValues?.localizedValues?.staticDuration?.text,
          });
          setIsDirectionsReady(decodedCoordinates.length > 1);
          fetchedNavigationTargetRef.current = targetNavigationPointId;
        }
      } catch (error) {
        logger.error('[useMapNavigationGuidance] Failed to fetch navigation directions', error);
        if (!isCancelled) {
          setNavigationPolylineCoordinates([]);
          setNavigationEndpoints(null);
          setIsDirectionsReady(false);
          setDirectionError('Failed to load directions. Please try again.');
        }
      } finally {
        if (!isCancelled) {
          setIsDirectionsLoading(false);
        }
        directionsInFlightTargetRef.current = null;
      }
    };

    fetchDirections();

    return () => {
      isCancelled = true;
    };
  }, [targetNavigationPointId, isMapReady, userLocation, mapPoints, alert, isGuidanceMode]);



  const onMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleExitGuidance = useCallback(() => {
    setIsGuidanceMode(false);
    setIsDirectionsLoading(false);
    setIsDirectionsReady(false);
    setDirectionError(null);
    setRouteSummary(null);
    setNavigationEndpoints(null);
    setNavigationPolylineCoordinates([]);
    fetchedNavigationTargetRef.current = null;
    directionsInFlightTargetRef.current = null;
    missingTargetAlertedRef.current = null;
    clearTargetNavigationParam();
  }, [clearTargetNavigationParam]);

  return {
    isGuidanceMode,
    isDirectionsLoading,
    isDirectionsReady,
    directionError,
    routeSummary,
    navigationPolylineCoordinates,
    onMapReady,
    handleExitGuidance,
    navigationEndpoints,
  };
}
