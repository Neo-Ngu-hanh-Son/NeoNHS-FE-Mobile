import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapPoint, RouteResponse, TravelMode } from '../../types';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { formatDistanceText, formatDurationText } from '../../helpers';
import { LatLng } from 'react-native-maps';
import { useDirectionsPreview } from './useCachedDirections';
import MAP_CONSTANTS from '../../constants';
import { MapViewMode } from '../../store/useMapStore';
import { useModal } from '@/app/providers/ModalProvider';
import { logger } from '@/utils/logger';
import { NHSMapRef } from '../../components';

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
  mapRef,
  focusOnPoint,
  fitCameraToCoordinates,
}: UseMapNavigationPreviewControllerProps) => {
  const { alert } = useModal();
  const [confirmedTravelMode, setConfirmedTravelMode] = useState<TravelMode | null>(null);
  const [selectedTravelMode, setSelectedTravelMode] = useState<TravelMode | null>(null);
  const [selectedDirectionsRoute, setSelectedDirectionsRoute] = useState<RouteResponse | null>(null);

  const activeGuidanceTargetPointId = confirmedTravelMode ? targetNavigationPointId : undefined;

  const navigationTargetPoint = useMemo(() => {
    if (!targetNavigationPointId) return null;
    return mapPoints.find((point) => point.id === targetNavigationPointId) ?? null;
  }, [mapPoints, targetNavigationPointId]);

  const previewOrigin = useMemo(() => {
    if (!userLocation) return null;
    return { latitude: userLocation.latitude, longitude: userLocation.longitude } as LatLng;
  }, [userLocation]);

  const previewDestination = useMemo(() => {
    if (!navigationTargetPoint) return null;
    const latitude = parseFloatOrDefault(navigationTargetPoint.latitude, NaN);
    const longitude = parseFloatOrDefault(navigationTargetPoint.longitude, NaN);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
  }, [navigationTargetPoint]);

  const previewParams = useMemo(() => {
    if (!previewOrigin || !previewDestination || !selectedTravelMode) return null;
    return { origin: previewOrigin, destination: previewDestination, travelMode: selectedTravelMode };
  }, [previewDestination, previewOrigin, selectedTravelMode]);

  const shouldFetchPreviewRoute = Boolean(targetNavigationPointId && viewMode === 'PREVIEWING_NAVIGATION');

  const buildPreviewRouteQuery = useCallback(() => {
    if (!previewOrigin || !previewDestination || !selectedTravelMode) return null;
    return {
      origin: previewOrigin,
      destination: previewDestination,
      travelMode: selectedTravelMode,
    };
  }, [previewOrigin, previewDestination, selectedTravelMode]);

  const previewRouteQuery = useDirectionsPreview(buildPreviewRouteQuery(), shouldFetchPreviewRoute);
  const previewRouteSummary = previewRouteQuery.data ?? null;

  const previewErrorMessage = useMemo(() => {
    if (!previewRouteQuery.isError) return null;
    logger.error(
      '[useMapNavigationPreviewController] Error states - previewOrigin:',
      previewOrigin,
      'previewDestination:',
      previewDestination,
      'isError:',
      previewRouteQuery.isError
    );
    if (targetNavigationPointId && !previewOrigin) return 'Getting current location...';
    if (targetNavigationPointId && !previewDestination) return 'Unable to read destination coordinates.';
    if (previewRouteQuery.isError) return 'Failed to load route preview.';
    return null;
  }, [previewDestination, previewOrigin, previewRouteQuery.isError, targetNavigationPointId]);

  const previewRouteLeg = previewRouteQuery.data?.routes?.[0]?.legs?.[0];

  const previewDistanceText = useMemo(() => formatDistanceText(previewRouteLeg?.distanceMeters), [previewRouteLeg]);
  const previewDurationText = useMemo(() => formatDurationText(previewRouteLeg?.duration), [previewRouteLeg]);

  const canStartGuidance =
    Boolean(previewRouteSummary?.routes?.[0]?.legs?.[0]) && !previewRouteQuery.isFetching && !previewErrorMessage;

  const activeTravelModeLabel = useMemo(() => {
    if (!selectedTravelMode) return null;
    return MAP_CONSTANTS.TRAVEL_MODE_LABELS[confirmedTravelMode ?? selectedTravelMode];
  }, [confirmedTravelMode, selectedTravelMode]);

  const handleStartNavigationWithSelectedMode = useCallback(async () => {
    if (!previewParams) {
      alert('Navigation Unavailable', 'Route preview is not ready yet. Please wait a moment.');
      return;
    }

    try {
      setConfirmedTravelMode(selectedTravelMode);
    } catch (error) {
      logger.error('[useMapNavigationController] Failed to start navigation with selected transport mode', error);
      alert('Navigation Unavailable', 'Failed to load this route mode. Please try again.');
    } finally {
      setViewMode('NAVIGATING');
    }
  }, [alert, previewParams, selectedTravelMode, setViewMode]);

  const clearTargetNavigationParam = useCallback(() => {
    navigation.setParams({
      targetNavigationPointId: undefined,
      transportMode: undefined,
      navigationRequestId: undefined,
    });
    setViewMode('EXPLORING');
  }, [navigation, setViewMode]);

  const handleFitRoute = useCallback(() => {
    if (!mapIsReady) return;
    if (!previewOrigin || !previewDestination) return;
    fitCameraToCoordinates?.(previewOrigin, previewDestination, {
      top: 160,
      right: 64,
      bottom: 360,
      left: 64,
    });
    // mapRef.current?.fitToCoordinates(
    //   [previewOrigin, previewDestination],
    //   {
    //     top: 160,
    //     right: 64,
    //     bottom: 360,
    //     left: 64,
    //   },
    //   true
    // );
  }, [mapIsReady, previewOrigin, previewDestination, fitCameraToCoordinates]);

  const handleTravelModeSelection = useCallback(
    (mode: TravelMode) => {
      setSelectedTravelMode(mode);
      if (!previewParams) return;

      // Focus the map on the route when a new transport mode is selected and the preview params are ready
      handleFitRoute();
    },
    [previewParams, handleFitRoute]
  );

  const handleCancelTransportSelection = useCallback(() => {
    setConfirmedTravelMode(null);
    clearTargetNavigationParam();
    setViewMode('EXPLORING');
  }, [clearTargetNavigationParam, setViewMode]);

  // This ref should handle the auto focus for the first time that the user enters the navigation preview screen
  const shouldAnimateRef = useRef(true);
  useEffect(() => {
    if (!shouldAnimateRef.current) return;
    if (viewMode !== 'PREVIEWING_NAVIGATION') return;
    if (!previewOrigin || !previewDestination) return;
    if (!mapIsReady) return; // Wait until map is ready

    handleFitRoute();
    shouldAnimateRef.current = false;
  }, [handleFitRoute, previewOrigin, previewDestination, viewMode, mapIsReady]);

  /**
   * Use effect to switch between explore mode and preview navigation (auto when mounted)
   */
  useEffect(() => {
    if (!targetNavigationPointId) {
      setConfirmedTravelMode(null);
      setViewMode('EXPLORING');
      return;
    }

    setSelectedTravelMode(MAP_CONSTANTS.DEFAULT_TRAVEL_MODE);
    setConfirmedTravelMode(null);
    setViewMode('PREVIEWING_NAVIGATION');
  }, [targetNavigationPointId, setViewMode, mapRef]);

  return {
    activeGuidanceTargetPointId,
    previewOrigin,
    previewDestination,
    navigationTargetPoint,
    previewParams,
    previewDistanceText,
    previewDurationText,
    previewErrorMessage,
    canStartGuidance,
    activeTravelModeLabel,
    previewRouteLeg,
    previewRouteSummary,
    previewRouteQuery,
    selectedTravelMode,
    confirmedTravelMode,
    selectedDirectionsRoute,

    handleStartNavigationWithSelectedMode,
    clearTargetNavigationParam,
    handleTravelModeSelection,
    handleCancelTransportSelection,
    setConfirmedTravelMode,
  };
};
