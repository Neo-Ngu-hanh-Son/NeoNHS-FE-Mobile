import { useCallback, useEffect, useRef, useState } from 'react';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { logger } from '@/utils/logger';
import { mapDirectionService } from '../services/mapDirectionService';
import { decodeRoutePolyline } from '../helpers';
import {
  Maneuver,
  MapPoint,
  NavigationStep,
  PolylineCoordinate,
  RouteResponse,
  Step,
} from '../types';
import type { LocationPermissionStatus, UserLocation } from './useUserLocation';
import { distanceUtils } from '@/utils/distanceUtils';

const formatDurationText = (duration?: string): string | undefined => {
  if (!duration) {
    return undefined;
  }

  const seconds = Number.parseInt(duration.replace('s', ''), 10);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return undefined;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }

  return `${minutes} min`;
};

const formatDistanceText = (distanceMeters?: number): string | undefined => {
  if (typeof distanceMeters !== 'number' || distanceMeters <= 0) {
    return undefined;
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

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
  routeSummary: RouteResponse | null;
  tripDurationText?: string;
  tripDistanceText?: string;
  currentManeuver: Maneuver | null;
  currentInstructionText?: string;
  currentStepDurationText?: string;
  currentStepDistanceText?: string;
  currentStepProgressText?: string;
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

  const [routeSummary, setRouteSummary] = useState<RouteResponse | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [navigationStep, setNavigationStep] = useState<NavigationStep | null>(null);
  const [currentUserStepIndex, setCurrentUserStepIndex] = useState(0);
  const [navigationPolylineCoordinates, setNavigationPolylineCoordinates] = useState<
    PolylineCoordinate[]
  >([]);
  const [navigationEndpoints, setNavigationEndpoints] = useState<{
    origin: PolylineCoordinate;
    destination: PolylineCoordinate;
  } | null>(null);

  const fetchedNavigationTargetRef = useRef<string | null>(null);
  const directionsInFlightTargetRef = useRef<string | null>(null);

  const resetDirectionState = useCallback(() => {
    setNavigationPolylineCoordinates([]);
    setIsDirectionsLoading(false);
    setIsDirectionsReady(false);
    setDirectionError(null);
    setRouteSummary(null);
    setSteps([]);
    setNavigationStep(null);
    setCurrentUserStepIndex(0);
    setNavigationEndpoints(null);
  }, []);

  const resetDirectionRefs = useCallback(() => {
    fetchedNavigationTargetRef.current = null;
    directionsInFlightTargetRef.current = null;
  }, []);

  const getDirectionsFetchContext = useCallback(() => {
    if (!isGuidanceMode || !targetNavigationPointId || !isMapReady || !userLocation) {
      return null;
    }

    if (mapPoints.length === 0) {
      return null;
    }

    return {
      targetId: targetNavigationPointId,
      origin: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
    };
  }, [isGuidanceMode, targetNavigationPointId, isMapReady, userLocation, mapPoints]);

  const getTrackingStartContext = useCallback(() => {
    if (!isGuidanceMode || !targetNavigationPointId) {
      return null;
    }
    if (permissionStatus !== 'granted' || userLocation || isTracking) {
      return null;
    }

    return { targetId: targetNavigationPointId };
  }, [isGuidanceMode, targetNavigationPointId, permissionStatus, userLocation, isTracking]);

  useEffect(() => {
    if (!targetNavigationPointId) {
      setIsGuidanceMode(false);
      resetDirectionState();
      resetDirectionRefs();
      return;
    }

    setIsGuidanceMode(true);
    resetDirectionRefs();
    resetDirectionState();
  }, [targetNavigationPointId, resetDirectionRefs, resetDirectionState]);

  useEffect(() => {
    const trackingStartContext = getTrackingStartContext();
    if (!trackingStartContext) {
      return;
    }

    startTracking();
  }, [getTrackingStartContext, startTracking]);

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
      alert('Navigation Unavailable', 'Unable to find the destination point on the map.');
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
      setIsDirectionsLoading(true);
      setIsDirectionsReady(false);
      setDirectionError(null);

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

          if (!isCancelled) {
            setDirectionError('Unable to build a route for this destination right now.');
          }
        }

        if (!isCancelled) {
          const nextSteps = leg?.steps ?? [];

          setNavigationPolylineCoordinates(decodedCoordinates);
          setNavigationEndpoints({
            origin: routeOrigin,
            destination: endPoint,
          });
          setRouteSummary(response.data);
          setIsDirectionsReady(decodedCoordinates.length > 1);
          fetchedNavigationTargetRef.current = targetId;
          setCurrentUserStepIndex(0);
          setNavigationStep({
            previousStep: null,
            currentStep: nextSteps[0] ?? null,
            nextStep: nextSteps[1] ?? null,
          });
          setSteps(nextSteps);
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
        // Always clear loading for this request cycle. During effect re-runs,
        // cleanup marks the old request as cancelled, and skipping this reset
        // can leave the overlay stuck in loading state.
        if (directionsInFlightTargetRef.current === targetId) {
          directionsInFlightTargetRef.current = null;
        }

        setIsDirectionsLoading(false);
      }
    };

    fetchDirections();

    return () => {
      isCancelled = true;
    };
  }, [getDirectionsFetchContext, mapPoints, alert]);

  useEffect(() => {
    if (!isGuidanceMode || !userLocation || steps.length === 0) {
      return;
    }

    const newCurrentUserStepIndex = distanceUtils.findCurrentUserStepIndex(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      currentUserStepIndex,
      steps
    );

    const boundedStepIndex = Math.min(Math.max(newCurrentUserStepIndex, 0), steps.length - 1);
    if (boundedStepIndex !== currentUserStepIndex) {
      setCurrentUserStepIndex(boundedStepIndex);
    }

    const currentStep = steps[boundedStepIndex] ?? null;
    const nextStep = steps[boundedStepIndex + 1] ?? null;
    setNavigationStep({
      previousStep: boundedStepIndex > 0 ? steps[boundedStepIndex - 1] : null,
      currentStep,
      nextStep,
    });
  }, [currentUserStepIndex, isGuidanceMode, steps, userLocation]);

  const onMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const handleExitGuidance = useCallback(() => {
    setIsGuidanceMode(false);
    resetDirectionState();
    resetDirectionRefs();
    clearTargetNavigationParam();
  }, [clearTargetNavigationParam, resetDirectionRefs, resetDirectionState]);

  const firstLeg = routeSummary?.routes?.[0]?.legs?.[0];
  const totalSteps = steps.length;
  const currentStep = navigationStep?.currentStep ?? null;
  const currentIndex = totalSteps > 0 ? Math.min(currentUserStepIndex, totalSteps - 1) : 0;

  const tripDistanceText = formatDistanceText(firstLeg?.distanceMeters);
  const tripDurationText = formatDurationText(firstLeg?.duration);

  const currentManeuver = currentStep?.navigationInstruction?.maneuver ?? null;
  const currentInstructionText = currentStep?.navigationInstruction?.instructions;
  const currentStepDistanceText = currentStep?.localizedValues?.distance?.text;
  const currentStepDurationText = currentStep?.localizedValues?.staticDuration?.text;
  const currentStepProgressText = totalSteps > 0 ? `Step ${currentIndex + 1} of ${totalSteps}` : undefined;

  return {
    isGuidanceMode,
    isDirectionsLoading,
    isDirectionsReady,
    directionError,
    routeSummary,
    tripDurationText,
    tripDistanceText,
    currentManeuver,
    currentInstructionText,
    currentStepDurationText,
    currentStepDistanceText,
    currentStepProgressText,
    navigationPolylineCoordinates,
    onMapReady,
    handleExitGuidance,
    navigationEndpoints,
  };
}
