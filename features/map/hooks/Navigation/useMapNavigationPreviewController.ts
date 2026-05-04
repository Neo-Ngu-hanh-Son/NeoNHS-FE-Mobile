import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapDirectionSource, MapPoint, RouteResponse, TravelMode } from '../../types';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { formatDistanceText, formatDurationText } from '../../utils/helpers';
import { LatLng } from 'react-native-maps';
import { useDirectionsPreview } from './useCachedDirections';
import MAP_CONSTANTS from '../../constants';
import { MapViewMode } from '../../store/useMapStore';
import { useModal } from '@/app/providers/ModalProvider';
import { logger } from '@/utils/logger';
import { NHSMapRef } from '../../components';
import { distanceUtils } from '@/utils/distanceUtils';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { useDirectionsNavigation } from './useDirectionsNavigation';

interface UseMapNavigationPreviewControllerProps {
  targetNavigationPointId?: string;
  mapPoints: MapPoint[];
  userLocation: { latitude: number; longitude: number } | null;
  navigation: any;
  mapRef: RefObject<NHSMapRef | null>;
  viewMode: MapViewMode;
  setViewMode: (mode: MapViewMode) => void;
  mapIsReady?: boolean;
  focusOnPoint?: (point: MapPoint) => void;
  fitCameraToCoordinates?: (
    origin: LatLng,
    destination: LatLng,
    options?: { top: number; right: number; bottom: number; left: number }
  ) => void;
}

export const useMapNavigationPreviewController = ({
  targetNavigationPointId,
  mapPoints,
  userLocation,
  viewMode,
  navigation,
  setViewMode,
  mapIsReady = false,
  fitCameraToCoordinates,
}: UseMapNavigationPreviewControllerProps) => {
  const { alert } = useModal();
  const [confirmedTravelMode, setConfirmedTravelMode] = useState<TravelMode | null>(null);
  const [selectedTravelMode, setSelectedTravelMode] = useState<TravelMode | null>(null);
  const { language } = useLanguage();

  const navigationTargetPoint = useMemo(() => {
    if (!targetNavigationPointId) return null;
    return mapPoints.find((point) => point.id === targetNavigationPointId) ?? null;
  }, [mapPoints, targetNavigationPointId]);

  // Decide if the origin is inside or not (to switch to local / google API)
  const userIsInside = useMemo(() => {
    if (!userLocation) return false;
    let inside = distanceUtils.isInsideThuySon({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    });
    return inside;
  }, [userLocation]);

  const targetIsInside = useMemo(() => {
    if (!navigationTargetPoint) return false;
    let inside = distanceUtils.isInsideThuySon({
      latitude: navigationTargetPoint.latitude,
      longitude: navigationTargetPoint.longitude,
    });
    return inside;
  }, [navigationTargetPoint]);

  const routingSource = useMemo(() => {
    let source = MapDirectionSource.GOOGLE;
    if (userIsInside && targetIsInside) {
      source = MapDirectionSource.CUSTOM;
    }
    return source;
  }, [userIsInside, targetIsInside]);

  const effectiveTravelMode = useMemo(() => {
    if (routingSource === MapDirectionSource.CUSTOM) {
      return 'WALK';
    }
    return selectedTravelMode;
  }, [routingSource, selectedTravelMode]);

  // Use the override if it exists, otherwise fallback to the userLocation prop
  const previewOrigin = useMemo(() => {
    return userLocation ? { latitude: userLocation.latitude, longitude: userLocation.longitude } : null;
  }, [userLocation]);

  // Use the override if it exists, otherwise fallback to the target point prop
  const previewDestination = useMemo(() => {
    if (!navigationTargetPoint) return null;

    const lat = parseFloatOrDefault(navigationTargetPoint.latitude, NaN);
    const lng = parseFloatOrDefault(navigationTargetPoint.longitude, NaN);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

    return { latitude: lat, longitude: lng };
  }, [navigationTargetPoint]);

  const previewParams = useMemo(() => {
    if (!previewOrigin || !previewDestination || !effectiveTravelMode) return null;
    return {
      origin: previewOrigin,
      destination: previewDestination,
      travelMode: effectiveTravelMode,
      source: routingSource,
    };
  }, [effectiveTravelMode, previewDestination, previewOrigin, routingSource]);

  // The fetching itself.
  const shouldFetchPreviewRoute =
    Boolean(previewParams) && !!targetNavigationPointId && viewMode === 'PREVIEWING_NAVIGATION';
  // const previewRouteQuery = useDirectionsNavigation(previewParams, shouldFetchPreviewRoute, routingSource, language);

  const previewRouteQuery = useDirectionsNavigation({
    params: {
      origin: previewParams?.origin ?? { latitude: 0, longitude: 0 },
      destination: previewParams?.destination ?? { latitude: 0, longitude: 0 },
      source: previewParams?.source ?? MapDirectionSource.GOOGLE,
      travelMode: previewParams?.travelMode ?? MAP_CONSTANTS.DEFAULT_TRAVEL_MODE,
    },
    enabled: shouldFetchPreviewRoute,
    language: language,
  });

  // Data extraction
  const previewRouteSummary = previewRouteQuery.data ?? null;
  const previewRouteLeg = previewRouteQuery.data?.routes?.[0]?.legs?.[0];
  const previewDistanceText = useMemo(() => formatDistanceText(previewRouteLeg?.distanceMeters), [previewRouteLeg]);
  const previewDurationText = useMemo(() => formatDurationText(previewRouteLeg?.duration), [previewRouteLeg]);
  const activeTravelModeLabel = useMemo(() => {
    if (!selectedTravelMode) return null;
    return MAP_CONSTANTS.TRAVEL_MODE_LABELS[
      confirmedTravelMode ?? selectedTravelMode ?? MAP_CONSTANTS.DEFAULT_TRAVEL_MODE
    ];
  }, [confirmedTravelMode, selectedTravelMode]);

  const clearTargetNavigationParam = useCallback(() => {
    setConfirmedTravelMode(null);
    setSelectedTravelMode(null);
  }, []);

  const handleStartNavigationWithSelectedMode = useCallback(async () => {
    if (!previewParams) {
      alert({
        title: 'Navigation Unavailable',
        message: 'Route preview is not ready yet. Please wait a moment.',
      });
      return;
    }
    if (!selectedTravelMode) {
      alert({
        title: 'Select a transport mode',
        message: 'Please choose how you want to travel.',
      });
      return;
    }
    if (confirmedTravelMode) {
      logger.warn('Already started navigation with mode: ', confirmedTravelMode);
      return;
    } // In case user spam the start button
    try {
      setConfirmedTravelMode(selectedTravelMode);
      setViewMode('NAVIGATING');
      logger.info('Starting navigation');
    } catch (error) {
      logger.error('[useMapNavigationController] Failed to start navigation with selected transport mode', error);
      alert({
        title: 'Navigation Unavailable',
        message: 'Failed to load this route mode. Please try again.',
      });
      clearTargetNavigationParam();
    }
  }, [alert, clearTargetNavigationParam, confirmedTravelMode, previewParams, selectedTravelMode, setViewMode]);

  const handleFitRoute = useCallback(() => {
    if (!mapIsReady) return;
    if (!previewOrigin || !previewDestination) return;
    fitCameraToCoordinates?.(previewOrigin, previewDestination, {
      top: 160,
      right: 64,
      bottom: 360,
      left: 64,
    });
  }, [mapIsReady, previewOrigin, previewDestination, fitCameraToCoordinates]);

  const handleTravelModeSelection = useCallback(
    (mode: TravelMode) => {
      setSelectedTravelMode(mode);
      if (!previewParams) return;
      handleFitRoute();
    },
    [previewParams, handleFitRoute]
  );

  /**
   * use effect to fit camera when start previewing
   */
  useEffect(() => {
    if (viewMode !== 'PREVIEWING_NAVIGATION') return;
    if (!previewRouteSummary) return;
    if (!mapIsReady) return;

    handleFitRoute();
  }, [handleFitRoute, viewMode, mapIsReady, previewRouteSummary]);

  /**
   * Use effect to previewing route if targetNavigationPointId exist
   */
  useEffect(() => {
    if (!targetNavigationPointId) {
      setConfirmedTravelMode(null);
      setSelectedTravelMode(null);
      setViewMode('EXPLORING');
      return;
    }

    setSelectedTravelMode((prev) => prev ?? MAP_CONSTANTS.DEFAULT_TRAVEL_MODE);

    setViewMode('PREVIEWING_NAVIGATION');
  }, [setViewMode, targetNavigationPointId]);

  const previewErrorMessage = useMemo(() => {
    if (!previewRouteQuery.isError) return null;
    logger.error(
      '[useMapNavigationPreviewController] Error states - previewOrigin:',
      previewOrigin,
      ' previewDestination:',
      previewDestination,
      'isError:',
      previewRouteQuery.error?.message
    );
    if (targetNavigationPointId && !previewOrigin) return 'Getting current location...';
    if (targetNavigationPointId && !previewDestination) return 'Unable to read destination coordinates.';
    if (previewRouteQuery.isError) return 'Failed to load route preview.';
    return null;
  }, [
    previewDestination,
    previewOrigin,
    previewRouteQuery.isError,
    previewRouteQuery.error?.message,
    targetNavigationPointId,
  ]);

  const canStartGuidance = useMemo(() => {
    // Just check if has the following: Has origin and destination, has route preview summary, has selected mode
    return !!previewOrigin && !!previewDestination && !!previewRouteSummary && !!selectedTravelMode;
  }, [previewOrigin, previewDestination, previewRouteSummary, selectedTravelMode]);

  // This will be used to pass to the other hook to start navigation.
  const activeGuidanceTargetPointId = useMemo(() => {
    return confirmedTravelMode ? targetNavigationPointId : undefined;
  }, [confirmedTravelMode, targetNavigationPointId]);

  return {
    previewOrigin,
    previewDestination,
    navigationTargetPoint,
    previewParams,
    previewDistanceText,
    previewDurationText,
    previewErrorMessage,
    activeTravelModeLabel,
    previewRouteLeg,
    previewRouteSummary,
    previewRouteQuery,
    selectedTravelMode,
    effectiveTravelMode,
    confirmedTravelMode,
    routingSource,
    canStartGuidance,
    activeGuidanceTargetPointId,

    handleStartNavigationWithSelectedMode,
    clearTargetNavigationParam,
    handleTravelModeSelection,
    setConfirmedTravelMode,
  };
};
