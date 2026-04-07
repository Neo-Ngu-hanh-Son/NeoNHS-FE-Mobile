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
import { useMapStore } from '../store/useMapStore';

type UseMapNavigationGuidanceParams = {
  targetNavigationPointId?: string;
  travelMode: TravelMode | null;
  mapPoints: MapPoint[];
  userLocation: UserLocation | null;
  permissionStatus: LocationPermissionStatus;
  isTracking: boolean;
  startTracking: () => Promise<void>;
  alert: (title: string, message: string) => void;
  clearTargetNavigationParam: () => void;
  previewRouteSummary: RouteResponse | null;
  previewErrorMessage: string | null;
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
  previewRouteSummary,
  previewErrorMessage,
}: UseMapNavigationGuidanceParams): UseMapNavigationGuidanceReturn {
  const [navigationStatus, setNavigationStatus] = useState<NavigationStatusState>({
    isMapReady: false,
    isUserArrived: false,
  });

  const viewMode = useMapStore((state) => state.viewMode);
  const isGuidanceMode = viewMode === 'NAVIGATING';
  const isDirectionsLoading = previewRouteSummary === null || previewRouteSummary === undefined;
  const isDirectionsReady = previewRouteSummary !== null || previewRouteSummary !== undefined;
  const directionError = previewErrorMessage;

  // 1. Extract the base legs for cleaner access
  const routeLeg = previewRouteSummary?.routes?.[0]?.legs?.[0];

  const steps = useMemo(() => {
    return previewRouteSummary?.routes?.[0]?.legs?.[0]?.steps ?? [];
  }, [previewRouteSummary]);

  // 3. Derived Polyline (Memoized because decoding can be CPU intensive)
  const navigationPolylineCoordinates = useMemo(() => {
    const encoded = previewRouteSummary?.routes?.[0]?.polyline?.encodedPolyline;
    return encoded ? decodeRoutePolyline(encoded) : [];
  }, [previewRouteSummary]);

  // 4. Derived Endpoints (Memoized to prevent unnecessary re-renders in Map components)
  const navigationEndpoints = useMemo(() => {
    const start = routeLeg?.startLocation?.latLng;
    const end = routeLeg?.endLocation?.latLng;

    if (!start || !end) return null;

    return {
      origin: {
        latitude: start.latitude,
        longitude: start.longitude,
      },
      destination: {
        latitude: end.latitude,
        longitude: end.longitude,
      },
    };
  }, [routeLeg]);

  const routeSummary = previewRouteSummary;

  const [currentUserStepIndex, setCurrentUserStepIndex] = useState(0);

  const getTrackingStartContext = useCallback(() => {
    if (!isGuidanceMode || !targetNavigationPointId) {
      return null;
    }
    if (permissionStatus !== 'granted' || !userLocation || isTracking) {
      return null;
    }

    return { targetId: targetNavigationPointId };
  }, [isGuidanceMode, targetNavigationPointId, permissionStatus, userLocation, isTracking]);

  const handleExitGuidance = useCallback(() => {
    setNavigationStatus((prev) => ({
      ...prev,
      isGuidanceMode: false,
      isUserArrived: false,
    }));
    clearTargetNavigationParam();
  }, [clearTargetNavigationParam]);

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

  // sync state with new route
  useEffect(() => {
    setNavigationStatus((prev) => ({
      ...prev,
      isDirectionsLoading: previewRouteSummary == null,
      isDirectionsReady: previewRouteSummary != null,
      directionError: previewErrorMessage,
    }));
  }, [previewRouteSummary, previewErrorMessage]);

  // reset step on new route
  useEffect(() => {
    setCurrentUserStepIndex(0);
  }, [steps]);

  /**
   * This effect watches for changes in the user's location and updates the current navigation step accordingly.
   */
  useEffect(() => {
    if (!userLocation || steps.length === 0 || !isGuidanceMode) {
      return;
    }
    const userLocationPoint = {
      longitude: userLocation.longitude,
      latitude: userLocation.latitude,
    };
    const nearestStepIndex = distanceUtils.findCurrentUserStepIndex(userLocationPoint, currentUserStepIndex, steps);

    let boundedStepIndex = Math.min(Math.max(nearestStepIndex, 0), steps.length - 1);

    const currentStep = steps[boundedStepIndex];
    const nextStep = steps[boundedStepIndex + 1];

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
        boundedStepIndex = Math.min(boundedStepIndex + 1, steps.length - 1);
      }
    }

    if (boundedStepIndex !== currentUserStepIndex) {
      setCurrentUserStepIndex(boundedStepIndex);
    }
  }, [currentUserStepIndex, isGuidanceMode, steps, userLocation]);

  const tripMetadata = useMemo<TripMetadata>(() => {
    const leg = routeSummary?.routes?.[0]?.legs?.[0];

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
  }, [routeSummary, steps, currentUserStepIndex]);

  /**
   * Handle watch current user location to determine if has arrived at destination.
   */
  useEffect(() => {
    if (!isGuidanceMode || !userLocation || !navigationEndpoints || navigationStatus.isUserArrived) {
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
      setNavigationStatus((prev) => ({
        ...prev,
        isUserArrived: true,
      }));
    }
  }, [isGuidanceMode, navigationEndpoints, userLocation, navigationStatus.isUserArrived]);

  const onMapReady = useCallback(() => {
    setNavigationStatus((prev) => ({
      ...prev,
      isMapReady: true,
    }));
  }, []);

  const totalSteps = steps.length;
  const currentIndex = totalSteps > 0 ? Math.min(currentUserStepIndex, totalSteps - 1) : 0;

  const currentStep = useMemo(() => {
    if (totalSteps === 0) {
      return null;
    }
    return steps[currentIndex] ?? null;
  }, [currentIndex, steps, totalSteps]);

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
    isGuidanceMode,
    isDirectionsLoading,
    isDirectionsReady,
    directionError,
    routeSummary,
    navigationSteps: steps,
    currentUserStepIndex,
    navigationPolylineCoordinates: navigationPolylineCoordinates,
    onMapReady,
    handleExitGuidance,
    isUserArrived: navigationStatus.isUserArrived,
    currentNavigationStepData,
  };
}
