import { useCallback, useEffect, useRef, useState } from 'react';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { logger } from '@/utils/logger';
import { mapDirectionService } from '../services/mapDirectionService';
import { decodeRoutePolyline, formatDistanceText, formatDurationText } from '../helpers';
import { CurrentNavigationStepData, MapPoint, NavigationStep, PolylineCoordinate, RouteResponse, Step } from '../types';
import type { LocationPermissionStatus, UserLocation } from './useUserLocation';
import { distanceUtils } from '@/utils/distanceUtils';


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
  navigationPolylineCoordinates: PolylineCoordinate[];
  onMapReady: () => void;
  handleExitGuidance: () => void;
  navigationEndpoints: {
    origin: PolylineCoordinate;
    destination: PolylineCoordinate;
  } | null;
  isUserArrived: boolean;
  currentNavigationStepData: CurrentNavigationStepData;
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
  const [navigationPolylineCoordinates, setNavigationPolylineCoordinates] = useState<PolylineCoordinate[]>([]);
  const [navigationEndpoints, setNavigationEndpoints] = useState<{
    origin: PolylineCoordinate;
    destination: PolylineCoordinate;
  } | null>(null);

  const [isUserArrived, setIsUserArrived] = useState(false);

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

  const handleExitGuidance = useCallback(() => {
    setIsUserArrived(false);
    setIsGuidanceMode(false);
    resetDirectionState();
    resetDirectionRefs();
    clearTargetNavigationParam();
  }, [clearTargetNavigationParam, resetDirectionRefs, resetDirectionState]);

  /**
   * Use effect to reset navigation states
   */
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

  /**
   * Use effect to start tracking user location if guidance mode is initiated and tracking hasn't started yet
   */
  useEffect(() => {
    const trackingStartContext = getTrackingStartContext();
    if (!trackingStartContext) {
      return;
    }

    startTracking();
  }, [getTrackingStartContext, startTracking]);

  /**
   * Use effect to fetch navigation directions when guidance mode is initiated and a target navigation point is set
   */
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
          setCurrentUserStepIndex(0);
          setNavigationStep({
            previousStep: null,
            currentStep: nextSteps[0] ?? null,
            nextStep: nextSteps[1] ?? null,
          });
          setSteps(nextSteps);

          fetchedNavigationTargetRef.current = targetId;
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

  /**
   * This effect watches for changes in the user's location and updates the current navigation step accordingly.
   */
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

  /**
   * Handle watch current user location to determine if has arrived at destination.
   */
  useEffect(() => {
    if (!isGuidanceMode || !userLocation || !navigationEndpoints || isUserArrived) {
      return;
    }

    const hasArrived = distanceUtils.hasUserArrivedAtDestination(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      navigationEndpoints.destination
    );

    if (hasArrived) {
      setIsUserArrived(true);
    }
  }, [isGuidanceMode, navigationEndpoints, userLocation, isUserArrived]);

  const onMapReady = useCallback(() => {
    setIsMapReady(true);
  }, []);

  const firstLeg = routeSummary?.routes?.[0]?.legs?.[0];
  const totalSteps = steps.length;
  const currentStep = navigationStep?.currentStep ?? null;
  const currentIndex = totalSteps > 0 ? Math.min(currentUserStepIndex, totalSteps - 1) : 0;

  const currentNavigationStepData: CurrentNavigationStepData = {
    // Trip is the overall summary of the entire route (How many are left)
    tripDistanceText: formatDistanceText(firstLeg?.distanceMeters),
    tripDurationText: formatDurationText(firstLeg?.duration),

    currentManeuver: currentStep?.navigationInstruction?.maneuver ?? null,
    currentInstructionText: currentStep?.navigationInstruction?.instructions,
    currentStepDistanceText: currentStep?.localizedValues?.distance?.text,
    currentStepDurationText: currentStep?.localizedValues?.staticDuration?.text,
    currentStepProgressText: totalSteps > 0 ? `Step ${currentIndex + 1} of ${totalSteps}` : undefined,
  };

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
    isUserArrived,
    currentNavigationStepData,
  };
}
