import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@/utils/logger';
import {
  decodeRoutePolyline,
  extractStreetNameFromInstruction,
  formatDistanceText,
  formatDurationText,
  getFirstInstruction,
  parseDurationSeconds,
} from '../../utils/helpers';
import {
  CurrentNavigationStepData,
  MapDirectionSource,
  NavigationStatusState,
  PolylineCoordinate,
  RouteResponse,
  Step,
  TravelMode,
  TripMetadata,
} from '../../types';
import type { UserLocation } from '../useUserLocation';
import { distanceUtils } from '@/utils/distanceUtils';
import MAP_CONSTANTS from '../../constants';
import * as Speech from 'expo-speech';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { useDirectionsNavigation } from './useDirectionsNavigation';
import { LatLng } from 'react-native-maps/dist/src/specs/NativeComponentMarker';
import { SPEECH_LANGUAGE_MAP } from '@/utils/languageUtils';
import { useTranslation } from 'react-i18next';

type UseMapNavigationGuidanceParams = {
  origin: LatLng;
  destination: LatLng;
  source: MapDirectionSource;
  travelMode: TravelMode;

  userLocation: UserLocation | null;
  startTracking: () => Promise<void>;
  viewMode: string;
  previewRouteSummary: RouteResponse | null;
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

export function useMapNavigationGuidance({
  origin,
  destination,
  source,
  travelMode,

  userLocation,
  startTracking,
  viewMode,
  previewRouteSummary,
}: UseMapNavigationGuidanceParams) {
  const [navigationStatus, setNavigationStatus] = useState<NavigationStatusState>({
    isMapReady: false,
    isUserArrived: false,
  });

  const [currentUserStepIndex, setCurrentUserStepIndex] = useState(0);
  const currentStepIndexRef = useRef(0); // This is solely for calculations
  const { language } = useLanguage();
  const { t } = useTranslation();

  const isGuidanceMode = viewMode === 'NAVIGATING';

  const [routeFetchOrigin, setRouteFetchOrigin] = useState<LatLng>(
    userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : origin
  );

  const navigationParams = useMemo(() => {
    let safeOrigin = undefined;

    if (
      routeFetchOrigin &&
      typeof routeFetchOrigin.latitude === 'number' &&
      typeof routeFetchOrigin.longitude === 'number'
    ) {
      safeOrigin = routeFetchOrigin;
    } else if (userLocation && typeof userLocation.latitude === 'number') {
      safeOrigin = { latitude: userLocation.latitude, longitude: userLocation.longitude };
    } else {
      safeOrigin = origin;
    }

    return {
      origin: safeOrigin,
      destination: destination,
      source: source,
      travelMode: travelMode,
      language: language,
    };
  }, [routeFetchOrigin, destination, source, travelMode, userLocation, origin, language]);

  const navigationQuery = useDirectionsNavigation({
    params: navigationParams,
    enabled: isGuidanceMode,
    initialData: previewRouteSummary,
    originKey: routeFetchOrigin,
    language: language,
  });

  const routeSummary = navigationQuery.data;
  const errorMessage = navigationQuery.error?.message ?? null;

  const isDirectionsReady = routeSummary != null;

  // Extract the base legs for cleaner access
  const routeLeg = useMemo(() => routeSummary?.routes?.[0]?.legs?.[0], [routeSummary]);

  const steps = useMemo(() => {
    return routeLeg?.steps ?? [];
  }, [routeLeg]);

  // Derived Polyline (Memoized because decoding can be CPU intensive)
  const navigationPolylineCoordinates = useMemo(() => {
    const encoded = routeSummary?.routes?.[0]?.polyline?.encodedPolyline;
    return encoded ? decodeRoutePolyline(encoded) : [];
  }, [routeSummary]);

  // Derived Endpoints (Memoized to prevent unnecessary re-renders in Map components)
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

  const handleExitGuidance = useCallback(() => {
    setNavigationStatus((prev) => ({
      ...prev,
      isGuidanceMode: false,
      isUserArrived: false,
    }));
  }, []);

  const isOffRoute = useMemo(() => {
    if (!userLocation || steps.length === 0) return false;

    const userLocationPoint = {
      longitude: userLocation.longitude,
      latitude: userLocation.latitude,
    };
    const index = currentStepIndexRef.current;
    // Check multiple steps ahead to find the closest one and use it as measurement for off-route detection
    const checkSteps = steps.slice(Math.max(0, index - 1), index + 2);
    if (checkSteps.length === 0) return false;

    let minDistance = Infinity;

    for (const step of checkSteps) {
      const distance = distanceUtils.calculatePointToLineDistance(
        userLocationPoint,
        {
          latitude: step.startLocation.latLng.latitude,
          longitude: step.startLocation.latLng.longitude,
        },
        {
          latitude: step.endLocation.latLng.latitude,
          longitude: step.endLocation.latLng.longitude,
        }
      );

      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    // logger.info(
    //   'Off route status: ',
    //   minDistance,
    //   'Threshold: ',
    //   MAP_CONSTANTS.NAVIGATION_DISTANCE_LIMIT_BEFORE_REFETCH_OFF_ROUTE_M
    // );
    return minDistance > MAP_CONSTANTS.NAVIGATION_DISTANCE_LIMIT_BEFORE_REFETCH_OFF_ROUTE_M;
  }, [userLocation, steps]);

  /**
   * Use effect to refetch map directions only when the user is off route
   */
  useEffect(() => {
    if (!isGuidanceMode || !userLocation || navigationQuery.isFetching) return;

    if (isOffRoute) {
      // logger.info('User is off route. Updating origin to trigger a new route fetch.', {
      //   reason: 'off-route',
      // });

      const newOrigin = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      };

      // logger.info('off-route: routeFetchOrigin: ', routeFetchOrigin, ' newOrigin: ', newOrigin);
      if (!routeFetchOrigin) {
        setRouteFetchOrigin(newOrigin);
        return;
      }

      const distFromLastFetch = distanceUtils.calculateDistance(newOrigin, routeFetchOrigin);

      if (distFromLastFetch > MAP_CONSTANTS.NAVIGATION_DISTANCE_LIMIT_BEFORE_REFETCH_OFF_ROUTE_M) {
        setRouteFetchOrigin(newOrigin);
      }
    }
  }, [userLocation, isGuidanceMode, isOffRoute, navigationQuery.isFetching, navigationQuery, routeFetchOrigin]);

  /**
   * Use effect to start tracking user location if guidance mode is initiated and tracking hasn't started yet
   */
  useEffect(() => {
    if (isGuidanceMode) {
      startTracking();
    }
  }, [isGuidanceMode, startTracking]);

  // sync state with new route
  useEffect(() => {
    setNavigationStatus((prev) => ({
      ...prev,
      isDirectionsLoading: navigationQuery.isLoading,
      isDirectionsReady: routeSummary != null,
      directionError: errorMessage,
    }));
  }, [routeSummary, errorMessage, navigationQuery.isLoading]);

  // reset step on new route
  useEffect(() => {
    setCurrentUserStepIndex(0);
    currentStepIndexRef.current = 0;
  }, [steps]);

  const handleSpeakSteps = useCallback(
    async (instructions: string | undefined) => {
      if (!instructions) {
        logger.warn('[handleSpeakSteps] No instructions to speak');
        return;
      }

      if (instructions.includes('CUSTOM')) {
        logger.info('[handleSpeakSteps] Custom instruction, skipping speech');
        return;
      }

      let speechText = instructions.slice(0, Speech.maxSpeechInputLength);
      let firstInstruction = getFirstInstruction(speechText);
      const speechLanguage = SPEECH_LANGUAGE_MAP[language] || 'en-US';

      Speech.speak(firstInstruction, {
        language: speechLanguage,
        rate: 1.0,
        pitch: 1.0,
      });
    },
    [language]
  );

  /**
   * This effect watches for changes in the user's location and updates the current navigation step accordingly.
   * Note: Steps will only advance instead of going backwards to prevent jerky UI
   */
  /**
   * This effect watches for changes in the user's location and updates the current navigation step accordingly.
   */
  useEffect(() => {
    const handleNextSteps = async () => {
      if (!userLocation || steps.length === 0 || !isGuidanceMode) {
        return;
      }
      const userLocationPoint = {
        longitude: userLocation.longitude,
        latitude: userLocation.latitude,
      };

      const nearestStepIndex = distanceUtils.findCurrentUserStepIndex(userLocationPoint, currentUserStepIndex, steps);

      // Never allow the step index to go backwards.
      let candidateIndex = Math.max(currentUserStepIndex, nearestStepIndex);
      candidateIndex = Math.min(candidateIndex, steps.length - 1);

      const currentStep = steps[candidateIndex];
      const nextStep = steps[candidateIndex + 1];

      // Around junctions, proactively advance to next step if needed
      if (currentStep && nextStep) {
        const distanceToCurrentStepEnd = distanceUtils.calculateDistance(userLocationPoint, {
          latitude: currentStep.endLocation.latLng.latitude,
          longitude: currentStep.endLocation.latLng.longitude,
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
          candidateIndex = Math.min(candidateIndex + 1, steps.length - 1);
        }
      }

      // Only trigger speech and state updates if we are actually moving FORWARD.
      if (candidateIndex > currentUserStepIndex) {
        setCurrentUserStepIndex(candidateIndex);
        currentStepIndexRef.current = candidateIndex;

        const nextInstruction = steps[candidateIndex].navigationInstruction?.instructions;

        if (nextInstruction) {
          Speech.stop(); // Immediately stop the previous instruction
          await handleSpeakSteps(nextInstruction);
          // logger.debug('Speaking:', nextInstruction);
        }
      }
    };

    handleNextSteps();
  }, [currentUserStepIndex, handleSpeakSteps, isGuidanceMode, steps, userLocation]);

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

  const totalSteps = steps.length;
  const currentIndex = totalSteps > 0 ? Math.min(currentUserStepIndex, totalSteps - 1) : 0;

  const currentStep = useMemo(() => {
    if (totalSteps === 0) {
      return null;
    }
    return steps[currentIndex] ?? null;
  }, [currentIndex, steps, totalSteps]);

  const currentNavigationStepData: CurrentNavigationStepData = useMemo(() => {
    // note: Base maneuever is the instruction for the end point of a road, not the start point.
    // But there is an exception of the first road, which contain both the start and end instruction step.
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
      // If the user is in between the start and end point of a step,
      // display a generic message: "Continue follow the {streetName}"
      if (shouldEnterContinueStraight) {
        const streetName = extractStreetNameFromInstruction(baseInstruction);
        currentManeuver = 'STRAIGHT';
        currentInstructionText = streetName ? t('map.follow_the_road') : t('map.follow_the_road');
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
    isDirectionsLoading: navigationQuery.isLoading,
    isDirectionsReady,
    directionError: errorMessage,
    routeSummary,
    navigationSteps: steps,
    currentUserStepIndex,
    navigationPolylineCoordinates: navigationPolylineCoordinates,
    handleExitGuidance,
    isUserArrived: navigationStatus.isUserArrived,
    currentNavigationStepData,
  };
}
