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

  // State overrides for dynamic refetching (e.g. off-track handling)
  const [originOverride, setOriginOverride] = useState<LatLng | null>(null);
  const [destinationOverride, setDestinationOverride] = useState<LatLng | null>(null);

  const activeGuidanceTargetPointId = confirmedTravelMode ? targetNavigationPointId : undefined;

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
    logger.debug('[useMapNavigationPreviewController] routingSource', source);
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
    if (originOverride) return originOverride;
    if (!userLocation) return null;
    return { latitude: userLocation.latitude, longitude: userLocation.longitude } as LatLng;
  }, [originOverride, userLocation]);

  // Use the override if it exists, otherwise fallback to the target point prop
  const previewDestination = useMemo(() => {
    if (destinationOverride) return destinationOverride;
    if (!navigationTargetPoint) return null;
    const latitude = parseFloatOrDefault(navigationTargetPoint.latitude, NaN);
    const longitude = parseFloatOrDefault(navigationTargetPoint.longitude, NaN);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
  }, [destinationOverride, navigationTargetPoint]);

  const previewParams = useMemo(() => {
    if (!previewOrigin || !previewDestination || !effectiveTravelMode) return null;
    return {
      origin: previewOrigin,
      destination: previewDestination,
      travelMode: effectiveTravelMode,
      source: routingSource,
    };
  }, [effectiveTravelMode, previewDestination, previewOrigin, routingSource]);

  const shouldFetchPreviewRoute = Boolean(targetNavigationPointId && viewMode === 'PREVIEWING_NAVIGATION');

  // The fetching itself.
  const previewRouteQuery = useDirectionsPreview(previewParams, shouldFetchPreviewRoute, routingSource);
  const previewRouteSummary = previewRouteQuery.data ?? null;

  const previewRouteLeg = previewRouteQuery.data?.routes?.[0]?.legs?.[0];

  const previewDistanceText = useMemo(() => formatDistanceText(previewRouteLeg?.distanceMeters), [previewRouteLeg]);
  const previewDurationText = useMemo(() => formatDurationText(previewRouteLeg?.duration), [previewRouteLeg]);

  const activeTravelModeLabel = useMemo(() => {
    if (!selectedTravelMode) return null;
    return MAP_CONSTANTS.TRAVEL_MODE_LABELS[confirmedTravelMode ?? selectedTravelMode];
  }, [confirmedTravelMode, selectedTravelMode]);

  /**
   * Updates current routing parameters and automatically triggers a route refetch.
   * Partial updates allowed. Will not clear existing parameters.
   */
  const updateNavigationParams = useCallback(
    (params: Partial<{ origin: LatLng; destination: LatLng; travelMode: TravelMode }>) => {
      if (params.origin) setOriginOverride(params.origin);
      if (params.destination) setDestinationOverride(params.destination);
      if (params.travelMode) setSelectedTravelMode(params.travelMode);
    },
    []
  );

  /**
   * Explicitly clears state overrides so routing falls back to prop-driven origins/destinations.
   */
  const clearNavigationOverrides = useCallback(() => {
    setOriginOverride(null);
    setDestinationOverride(null);
  }, []);

  // ---------------------------------------------------

  const clearTargetNavigationParam = useCallback(() => {
    navigation.setParams({
      targetNavigationPointId: undefined,
      transportMode: undefined,
      navigationRequestId: undefined,
    });
    setViewMode('EXPLORING');
    clearNavigationOverrides();
  }, [navigation, setViewMode, clearNavigationOverrides]);

  const handleStartNavigationWithSelectedMode = useCallback(async () => {
    if (!previewParams) {
      alert({
        title: 'Navigation Unavailable',
        message: 'Route preview is not ready yet. Please wait a moment.',
      });
      return;
    }

    try {
      setConfirmedTravelMode(selectedTravelMode);
    } catch (error) {
      logger.error('[useMapNavigationController] Failed to start navigation with selected transport mode', error);
      alert({
        title: 'Navigation Unavailable',
        message: 'Failed to load this route mode. Please try again.',
      });
    } finally {
      setViewMode('NAVIGATING');
    }
  }, [alert, previewParams, selectedTravelMode, setViewMode]);

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

  const handleCancelTransportSelection = useCallback(() => {
    setConfirmedTravelMode(null);
    clearTargetNavigationParam();
    setViewMode('EXPLORING');
  }, [clearTargetNavigationParam, setViewMode]);

  const shouldAnimateRef = useRef(true);
  useEffect(() => {
    if (!shouldAnimateRef.current) return;
    if (viewMode !== 'PREVIEWING_NAVIGATION') return;
    if (!previewOrigin || !previewDestination) return;
    if (!mapIsReady) return;

    handleFitRoute();
    shouldAnimateRef.current = false;
  }, [handleFitRoute, previewOrigin, previewDestination, viewMode, mapIsReady]);

  useEffect(() => {
    if (!targetNavigationPointId) {
      setConfirmedTravelMode(null);
      setViewMode('EXPLORING');
      clearNavigationOverrides(); // Clean up state when target is lost
      return;
    }

    setSelectedTravelMode(MAP_CONSTANTS.DEFAULT_TRAVEL_MODE);
    setConfirmedTravelMode(null);
    setViewMode('PREVIEWING_NAVIGATION');
  }, [targetNavigationPointId, setViewMode, mapRef, clearNavigationOverrides]);

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

  const canStartGuidance = useMemo(() => {
    return (
      Boolean(previewRouteSummary?.routes?.[0]?.legs?.[0]) && !previewRouteQuery.isFetching && !previewErrorMessage
    );
  }, [previewRouteSummary, previewRouteQuery.isFetching, previewErrorMessage]);

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
    effectiveTravelMode,
    confirmedTravelMode,
    selectedDirectionsRoute,
    routingSource,

    // Expose the new updater functions
    updateNavigationParams,
    clearNavigationOverrides,

    handleStartNavigationWithSelectedMode,
    clearTargetNavigationParam,
    handleTravelModeSelection,
    handleCancelTransportSelection,
    setConfirmedTravelMode,
  };
};
