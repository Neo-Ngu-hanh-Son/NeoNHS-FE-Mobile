import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPoint, RouteResponse, TravelMode } from '../../types';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { formatDistanceText, formatDurationText } from '../../helpers';
import { LatLng } from 'react-native-maps';
import { useDirectionsCacheClient, useDirectionsPreview } from '../useCachedDirections';
import MAP_CONSTANTS from '../../constants';
import { MapViewMode, useMapStore } from '../../store/useMapStore';
import { useModal } from '@/app/providers/ModalProvider';
import { logger } from '@/utils/logger';

interface UseMapNavigationControllerProps {
  targetNavigationPointId?: string;
  mapPoints: MapPoint[];
  userLocation: { latitude: number; longitude: number } | null;
  viewMode: MapViewMode;
  requestedTransportMode: TravelMode | undefined;
  navigation: any;
}

export const useMapNavigationPreviewController = ({
  targetNavigationPointId,
  mapPoints,
  userLocation,
  viewMode,
  requestedTransportMode,
  navigation,
}: UseMapNavigationControllerProps) => {
  const { alert } = useModal();
  const setViewMode = useMapStore((state) => state.setViewMode);
  const { fetchDirectionsWithCache } = useDirectionsCacheClient();
  const [confirmedTravelMode, setConfirmedTravelMode] = useState<TravelMode | null>(null);
  const [selectedTravelMode, setSelectedTravelMode] = useState<TravelMode>(MAP_CONSTANTS.DEFAULT_TRAVEL_MODE);

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
    if (!previewOrigin || !previewDestination) return null;
    return { origin: previewOrigin, destination: previewDestination, travelMode: selectedTravelMode };
  }, [previewDestination, previewOrigin, selectedTravelMode]);

  const shouldFetchPreviewRoute = Boolean(targetNavigationPointId && viewMode === 'PREVIEWING_NAVIGATION');

  const buildPreviewRouteQuery = () => {
    if (!previewOrigin || !previewDestination) return null;
    return {
      origin: previewOrigin,
      destination: previewDestination,
      travelMode: selectedTravelMode,
    };
  };

  const previewRouteQuery = useDirectionsPreview(buildPreviewRouteQuery(), shouldFetchPreviewRoute);

  const previewErrorMessage = useMemo(() => {
    if (targetNavigationPointId && !previewOrigin) return 'Getting current location...';
    if (targetNavigationPointId && !previewDestination) return 'Unable to read destination coordinates.';
    if (previewRouteQuery.isError) return 'Failed to load route preview.';
    return null;
  }, [previewDestination, previewOrigin, previewRouteQuery.isError, targetNavigationPointId]);

  const previewRouteLeg = previewRouteQuery.data?.routes?.[0]?.legs?.[0];
  const previewRouteSummary = previewRouteQuery.data ?? null;

  const previewDistanceText = useMemo(() => formatDistanceText(previewRouteLeg?.distanceMeters), [previewRouteLeg]);
  const previewDurationText = useMemo(() => formatDurationText(previewRouteLeg?.duration), [previewRouteLeg]);

  const canStartGuidance =
    Boolean(previewRouteSummary?.routes?.[0]?.legs?.[0]) && !previewRouteQuery.isFetching && !previewErrorMessage;

  const activeTravelModeLabel = useMemo(() => {
    return MAP_CONSTANTS.TRAVEL_MODE_LABELS[confirmedTravelMode ?? selectedTravelMode];
  }, [confirmedTravelMode, selectedTravelMode]);

  const handleStartNavigationWithSelectedMode = useCallback(async () => {
    if (!previewParams) {
      alert('Navigation Unavailable', 'Route preview is not ready yet. Please wait a moment.');
      return;
    }

    try {
      await fetchDirectionsWithCache(previewParams);
      setConfirmedTravelMode(selectedTravelMode);
    } catch (error) {
      logger.error('[useMapNavigationController] Failed to start navigation with selected transport mode', error);
      alert('Navigation Unavailable', 'Failed to load this route mode. Please try again.');
    } finally {
      setViewMode('NAVIGATING');
    }
  }, [alert, fetchDirectionsWithCache, previewParams, selectedTravelMode, setViewMode]);

  const clearTargetNavigationParam = useCallback(() => {
    navigation.setParams({
      targetNavigationPointId: undefined,
      transportMode: undefined,
      navigationRequestId: undefined,
    });
    setViewMode('EXPLORING');
  }, [navigation, setViewMode]);

  const handleTravelModeSelection = useCallback((mode: TravelMode) => {
    setSelectedTravelMode(mode);
  }, []);

  const handleCancelTransportSelection = useCallback(() => {
    setConfirmedTravelMode(null);
    clearTargetNavigationParam();
    setViewMode('EXPLORING');
  }, [clearTargetNavigationParam, setViewMode]);

  /**
   * Use effect to switch between explore mode and preview navigation (auto when mounted)
   */
  useEffect(() => {
    if (!targetNavigationPointId) {
      setConfirmedTravelMode(null);
      setViewMode('EXPLORING');
      return;
    }

    setSelectedTravelMode(requestedTransportMode ?? MAP_CONSTANTS.DEFAULT_TRAVEL_MODE);
    setConfirmedTravelMode(null);
    setViewMode('PREVIEWING_NAVIGATION');
  }, [requestedTransportMode, targetNavigationPointId, setViewMode]);

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

    handleStartNavigationWithSelectedMode,
    clearTargetNavigationParam,
    handleTravelModeSelection,
    handleCancelTransportSelection,
    setConfirmedTravelMode,
    setSelectedTravelMode,
  };
};
