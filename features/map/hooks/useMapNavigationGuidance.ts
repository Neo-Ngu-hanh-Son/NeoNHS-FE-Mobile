import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { logger } from '@/utils/logger';
import {
  decodeRoutePolyline,
  extractStreetNameFromInstruction,
  formatDistanceText,
  formatDurationText,
  parseDurationSeconds,
} from '../helpers';
import {
  CurrentNavigationStepData,
  MapPoint,
  NavigationRouteState,
  NavigationStatusState,
  PolylineCoordinate,
  RouteResponse,
  Step,
  TravelMode,
  TripMetadata,
} from '../types';
import type { LocationPermissionStatus, UserLocation } from './useUserLocation';
import { distanceUtils } from '@/utils/distanceUtils';
import MAP_CONSTANTS from '../constants';
import { buildDirectionsQueryOptions } from './useCachedDirections';

type UseMapNavigationGuidanceParams = {
  targetNavigationPointId?: string;
  travelMode: TravelMode;
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
  navigationSteps: Step[];
  currentUserStepIndex: number;
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

const EMPTY_TRIP_METADATA: TripMetadata = {
  tripTotalDistanceText: undefined,
  tripTotalDurationText: undefined,
  tripRemainingDistanceText: undefined,
  tripRemainingDurationText: undefined,
  tripTotalDistanceMeters: undefined,
  tripTotalDuration: undefined,
  tripRemainingDistanceMeters: undefined,
  tripRemainingDuration: undefined,
};

// TODO: Format this function holy shiba
export function useMapNavigationGuidance({
  targetNavigationPointId,
  travelMode,
  mapPoints,
  userLocation,
  permissionStatus,
  isTracking,
  startTracking,
  alert,
  clearTargetNavigationParam,
}: UseMapNavigationGuidanceParams): UseMapNavigationGuidanceReturn {
  const queryClient = useQueryClient();
  const [navigationStatus, setNavigationStatus] = useState<NavigationStatusState>({
    isMapReady: false,
    isGuidanceMode: Boolean(targetNavigationPointId),
    isDirectionsLoading: false,
    isDirectionsReady: false,
    directionError: null,
    isUserArrived: false,
  });

  const [routeState, setRouteState] = useState<NavigationRouteState>({
    routeSummary: null,
    steps: [],
    navigationPolylineCoordinates: [],
    navigationEndpoints: null,
  });

  const [currentUserStepIndex, setCurrentUserStepIndex] = useState(0); // Index of the current step

  const fetchedNavigationTargetRef = useRef<string | null>(null);
  const directionsInFlightTargetRef = useRef<string | null>(null);

  const resetDirectionState = useCallback(() => {
    logger.info('Resetting navigation state');
    setRouteState({
      routeSummary: null,
      steps: [],
      navigationPolylineCoordinates: [],
      navigationEndpoints: null,
    });
    setNavigationStatus((prev) => ({
      ...prev,
      isDirectionsLoading: false,
      isDirectionsReady: false,
      directionError: null,
      isUserArrived: false,
    }));
    setCurrentUserStepIndex(0);
  }, []);

  const resetDirectionRefs = useCallback(() => {
    fetchedNavigationTargetRef.current = null;
    directionsInFlightTargetRef.current = null;
  }, []);

  const getDirectionsFetchContext = useCallback(() => {
    if (!navigationStatus.isGuidanceMode || !targetNavigationPointId || !navigationStatus.isMapReady || !userLocation) {
      return null;
    }

    if (mapPoints.length === 0) {
      return null;
    }

    return {
      targetId: targetNavigationPointId,
      travelMode,
      origin: {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
    };
  }, [
    navigationStatus.isGuidanceMode,
    targetNavigationPointId,
    navigationStatus.isMapReady,
    userLocation,
    mapPoints,
    travelMode,
  ]);

  const getTrackingStartContext = useCallback(() => {
    if (!navigationStatus.isGuidanceMode || !targetNavigationPointId) {
      return null;
    }
    if (permissionStatus !== 'granted' || !userLocation || isTracking) {
      return null;
    }

    return { targetId: targetNavigationPointId };
  }, [navigationStatus.isGuidanceMode, targetNavigationPointId, permissionStatus, userLocation, isTracking]);

  const handleExitGuidance = useCallback(() => {
    setNavigationStatus((prev) => ({
      ...prev,
      isGuidanceMode: false,
      isUserArrived: false,
    }));
    resetDirectionState();
    resetDirectionRefs();
    clearTargetNavigationParam();
  }, [clearTargetNavigationParam, resetDirectionRefs, resetDirectionState]);

  /**
   * Use effect to reset navigation states
   */
  useEffect(() => {
    if (!targetNavigationPointId) {
      setNavigationStatus((prev) => ({
        ...prev,
        isGuidanceMode: false,
        isUserArrived: false,
      }));
      resetDirectionState();
      resetDirectionRefs();
      return;
    }

    setNavigationStatus((prev) => ({
      ...prev,
      isGuidanceMode: true,
      isUserArrived: false,
    }));
    resetDirectionRefs();
    resetDirectionState();
  }, [targetNavigationPointId, travelMode, resetDirectionRefs, resetDirectionState]);

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

    const { targetId, origin, travelMode: selectedTravelMode } = directionsFetchContext;
    const requestKey = `${targetId}:${selectedTravelMode}`;

    if (fetchedNavigationTargetRef.current === requestKey) {
      return;
    }
    if (directionsInFlightTargetRef.current === requestKey) {
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
      directionsInFlightTargetRef.current = requestKey;
      setNavigationStatus((prev) => ({
        ...prev,
        isDirectionsLoading: true,
        isDirectionsReady: false,
        directionError: null,
      }));

      try {
        const response = await queryClient.fetchQuery(
          buildDirectionsQueryOptions({
            origin,
            destination,
            travelMode: selectedTravelMode,
          })
        );

        const leg = response.routes?.[0]?.legs?.[0];
        const encodedPolyline = response.routes?.[0]?.polyline?.encodedPolyline;
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
            setNavigationStatus((prev) => ({
              ...prev,
              directionError: 'Unable to build a route for this destination right now.',
            }));
          }
        }

        if (!isCancelled) {
          const nextSteps = leg?.steps ?? [];
          setRouteState({
            routeSummary: response,
            steps: nextSteps,
            navigationPolylineCoordinates: decodedCoordinates,
            navigationEndpoints: {
              origin: routeOrigin,
              destination: endPoint,
            },
          });
          setNavigationStatus((prev) => ({
            ...prev,
            isDirectionsReady: decodedCoordinates.length > 1,
          }));
          setCurrentUserStepIndex(0);

          fetchedNavigationTargetRef.current = requestKey;
        }
      } catch (error) {
        logger.error('[useMapNavigationGuidance] Failed to fetch navigation directions', error);
        if (!isCancelled) {
          setRouteState((prev) => ({
            ...prev,
            navigationPolylineCoordinates: [],
            navigationEndpoints: null,
          }));
          setNavigationStatus((prev) => ({
            ...prev,
            isDirectionsReady: false,
            directionError: 'Failed to load directions. Please try again.',
          }));
        }
      } finally {
        if (directionsInFlightTargetRef.current === requestKey) {
          directionsInFlightTargetRef.current = null;
        }

        setNavigationStatus((prev) => ({
          ...prev,
          isDirectionsLoading: false,
        }));
      }
    };

    fetchDirections();

    return () => {
      isCancelled = true;
    };
  }, [getDirectionsFetchContext, mapPoints, alert, queryClient]);

  /**
   * This effect watches for changes in the user's location and updates the current navigation step accordingly.
   */
  useEffect(() => {
    if (!navigationStatus.isGuidanceMode || !userLocation || routeState.steps.length === 0) {
      return;
    }
    const userLocationPoint = {
      longitude: userLocation.longitude,
      latitude: userLocation.latitude,
    };
    const nearestStepIndex = distanceUtils.findCurrentUserStepIndex(
      userLocationPoint,
      currentUserStepIndex,
      routeState.steps
    );

    let boundedStepIndex = Math.min(Math.max(nearestStepIndex, 0), routeState.steps.length - 1);

    const currentStep = routeState.steps[boundedStepIndex];
    const nextStep = routeState.steps[boundedStepIndex + 1];

    // // Transition guard: nearest-segment matching can lag by one step around junctions.
    // // If user is close to the current step end, or clearly closer to the next segment,
    // // proactively advance to avoid one-step-behind UI.
    if (currentStep && nextStep) {
      const distanceToCurrentStepEnd = distanceUtils.calculateDistance(userLocationPoint, {
        latitude: currentStep.endLocation.latLng.latitude,
        longitude: currentStep.endLocation.latLng.longitude,
      });

      const distanceToCurrentStepStart = distanceUtils.calculateDistance(userLocationPoint, {
        latitude: currentStep.startLocation.latLng.latitude,
        longitude: currentStep.startLocation.latLng.longitude,
      });

      const currentSegmentDistance = distanceUtils.calculatePointToLineDistance(
        userLocationPoint,
        {
          latitude: currentStep.startLocation.latLng.latitude,
          longitude: currentStep.startLocation.latLng.longitude,
        },
        {
          latitude: currentStep.endLocation.latLng.latitude,
          longitude: currentStep.endLocation.latLng.longitude,
        }
      );

      const nextSegmentDistance = distanceUtils.calculatePointToLineDistance(
        userLocationPoint,
        {
          latitude: nextStep.startLocation.latLng.latitude,
          longitude: nextStep.startLocation.latLng.longitude,
        },
        {
          latitude: nextStep.endLocation.latLng.latitude,
          longitude: nextStep.endLocation.latLng.longitude,
        }
      );

      const shouldAdvance =
        distanceToCurrentStepEnd <= MAP_CONSTANTS.STEP_RADIUS_M ||
        nextSegmentDistance + MAP_CONSTANTS.ADVANCE_THRESHOLD_M < currentSegmentDistance;
      if (shouldAdvance) {
        logger.info('[useMapNavigationGuidance] Advancing to next step', {
          currentStepIndex: boundedStepIndex,
          distanceToCurrentStepEnd,
          distanceToCurrentStepStart,
          currentSegmentDistance,
          nextSegmentDistance,
        });
        boundedStepIndex = Math.min(boundedStepIndex + 1, routeState.steps.length - 1);
      }
    }

    if (boundedStepIndex !== currentUserStepIndex) {
      setCurrentUserStepIndex(boundedStepIndex);
    }
  }, [currentUserStepIndex, navigationStatus.isGuidanceMode, routeState.steps, userLocation]);

  const tripMetadata = useMemo<TripMetadata>(() => {
    const leg = routeState.routeSummary?.routes?.[0]?.legs?.[0];
    const steps = routeState.steps;

    if (!leg && steps.length === 0) {
      return EMPTY_TRIP_METADATA;
    }

    const totalDistanceFromSteps = steps.reduce((sum, step) => sum + (step.distanceMeters ?? 0), 0);
    const totalDurationFromSteps = steps.reduce(
      (sum, step) => sum + (parseDurationSeconds(step.staticDuration) ?? 0),
      0
    );

    const tripTotalDistanceMeters =
      leg?.distanceMeters ?? (totalDistanceFromSteps > 0 ? totalDistanceFromSteps : undefined);
    const tripTotalDuration =
      parseDurationSeconds(leg?.duration) ?? (totalDurationFromSteps > 0 ? totalDurationFromSteps : undefined);

    const completedStepCount = Math.min(Math.max(currentUserStepIndex, 0), steps.length);
    const completedDistanceMeters = steps
      .slice(0, completedStepCount)
      .reduce((sum, step) => sum + (step.distanceMeters ?? 0), 0);
    const completedDuration = steps
      .slice(0, completedStepCount)
      .reduce((sum, step) => sum + (parseDurationSeconds(step.staticDuration) ?? 0), 0);

    const tripRemainingDistanceMeters =
      tripTotalDistanceMeters !== undefined
        ? Math.max(tripTotalDistanceMeters - completedDistanceMeters, 0)
        : undefined;

    const tripRemainingDuration =
      tripTotalDuration !== undefined ? Math.max(tripTotalDuration - completedDuration, 0) : undefined;

    return {
      tripTotalDistanceText: formatDistanceText(tripTotalDistanceMeters),
      tripTotalDurationText: tripTotalDuration !== undefined ? formatDurationText(`${tripTotalDuration}s`) : undefined,
      tripRemainingDistanceText: formatDistanceText(tripRemainingDistanceMeters),
      tripRemainingDurationText:
        tripRemainingDuration !== undefined ? formatDurationText(`${tripRemainingDuration}s`) : undefined,
      tripTotalDistanceMeters,
      tripTotalDuration,
      tripRemainingDistanceMeters,
      tripRemainingDuration,
    };
  }, [routeState.routeSummary, routeState.steps, currentUserStepIndex]);

  /**
   * Handle watch current user location to determine if has arrived at destination.
   */
  useEffect(() => {
    if (
      !navigationStatus.isGuidanceMode ||
      !userLocation ||
      !routeState.navigationEndpoints ||
      navigationStatus.isUserArrived
    ) {
      return;
    }

    const hasArrived = distanceUtils.hasUserArrivedAtDestination(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      },
      routeState.navigationEndpoints.destination
    );

    if (hasArrived) {
      setNavigationStatus((prev) => ({
        ...prev,
        isUserArrived: true,
      }));
    }
  }, [navigationStatus.isGuidanceMode, routeState.navigationEndpoints, userLocation, navigationStatus.isUserArrived]);

  const onMapReady = useCallback(() => {
    setNavigationStatus((prev) => ({
      ...prev,
      isMapReady: true,
    }));
  }, []);

  const totalSteps = routeState.steps.length;
  const currentIndex = totalSteps > 0 ? Math.min(currentUserStepIndex, totalSteps - 1) : 0;

  useEffect(() => {
    // Reset mode when changing step (or leaving guidance) so each step derives instruction fresh.
  }, [currentIndex, navigationStatus.isGuidanceMode]);

  const currentStep = useMemo(() => {
    if (totalSteps === 0) {
      return null;
    }
    return routeState.steps[currentIndex] ?? null;
  }, [currentIndex, routeState.steps, totalSteps]);

  const currentNavigationStepData: CurrentNavigationStepData = useMemo(() => {
    // note: Base maneuever is the instruction for the end point of a road, not the start point. But there is an
    // exception of the first road, which contain both the initial instruction and an instruction for the end.
    const baseManeuver = currentStep?.navigationInstruction?.maneuver ?? null;
    const baseInstruction = currentStep?.navigationInstruction?.instructions;

    let currentManeuver = baseManeuver;
    let currentInstructionText = baseInstruction;
    let currentStepDistanceText = currentStep?.localizedValues?.distance?.text;

    if (currentStep && userLocation) {
      const userLocationPoint = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };

      const distanceToNextManeuver = distanceUtils.calculateDistance(userLocationPoint, {
        latitude: currentStep.endLocation.latLng.latitude,
        longitude: currentStep.endLocation.latLng.longitude,
      });

      const distanceToPreviousManeuver = distanceUtils.calculateDistance(userLocationPoint, {
        latitude: currentStep.startLocation.latLng.latitude,
        longitude: currentStep.startLocation.latLng.longitude,
      });

      const distanceToNextManeuverText = formatDistanceText(distanceToNextManeuver);

      const shouldEnterContinueStraight =
        distanceToNextManeuver > MAP_CONSTANTS.STEP_RADIUS_M &&
        distanceToPreviousManeuver > MAP_CONSTANTS.STEP_RADIUS_M;
      // If the user is in between the two start and end point, displaying a generic message: "Continue follow the {streetName}"
      if (shouldEnterContinueStraight) {
        const streetName = extractStreetNameFromInstruction(baseInstruction);
        currentManeuver = 'STRAIGHT';
        currentInstructionText = streetName ? `Continue on ${streetName}` : 'Continue straight';
      }

      // Show dynamic remaining distance to current maneuver in the top card metadata.
      if (distanceToNextManeuverText) {
        currentStepDistanceText = distanceToNextManeuverText;
      }
    }

    return {
      // Trip summary reflects remaining values after completed steps.
      tripDistanceText: tripMetadata.tripRemainingDistanceText,
      tripDurationText: tripMetadata.tripRemainingDurationText,
      currentManeuver,
      currentInstructionText,
      currentStepDistanceText,
      currentStepDurationText: currentStep?.localizedValues?.staticDuration?.text,
      currentStepProgressText: totalSteps > 0 ? `Step ${currentIndex + 1} of ${totalSteps}` : undefined,
    };
  }, [
    currentStep,
    userLocation,
    tripMetadata.tripRemainingDistanceText,
    tripMetadata.tripRemainingDurationText,
    totalSteps,
    currentIndex,
  ]);

  return {
    isGuidanceMode: navigationStatus.isGuidanceMode,
    isDirectionsLoading: navigationStatus.isDirectionsLoading,
    isDirectionsReady: navigationStatus.isDirectionsReady,
    directionError: navigationStatus.directionError,
    routeSummary: routeState.routeSummary,
    navigationSteps: routeState.steps,
    currentUserStepIndex,
    navigationPolylineCoordinates: routeState.navigationPolylineCoordinates,
    onMapReady,
    handleExitGuidance,
    navigationEndpoints: routeState.navigationEndpoints,
    isUserArrived: navigationStatus.isUserArrived,
    currentNavigationStepData,
  };
}
