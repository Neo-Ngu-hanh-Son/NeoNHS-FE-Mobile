import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { logger } from '@/utils/logger';
import { MapPoint, MapPointCheckin, TravelMode } from '../types';
import MapPointDetailModal from '../components/PointDetailModal/PointDetailModal';
import NHSMap, { NHSMapRef } from '../components/Map/NHSMap';
import NavigationGuideOverlay from '../components/Navigation/NavigationGuideOverlay';
import { MapMarkerFilterBar, TransportModeSelectorSheet } from '../components';
import { mapService } from '../services/mapServices';
import { useModal } from '@/app/providers/ModalProvider';
import {
  useDirectionsCacheClient,
  useDirectionsPreview,
  useMapMarkerFilters,
  useMapNavigationGuidance,
  useUserLocation,
} from '../hooks';
import { mapData } from '../data';
import { CompositeScreenProps, useIsFocused } from '@react-navigation/native';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { useQuery } from '@tanstack/react-query';
import CheckinCameraButton from '../components/Camera/CheckinCameraButton';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MAP_CONSTANTS from '../constants';
import { LocationAccuracy } from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import NavigationStepsBottomSheet from '../components/Navigation/NavigationStepsBottomSheet';
import { decodeRoutePolyline, formatDistanceText, formatDurationText } from '../helpers';

type MapScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Map'>,
  StackScreenProps<MainStackParamList>
>;
export default function MapScreen({ navigation, route }: MapScreenProps) {
  const { isAuthenticated } = useAuth();
  const initialPointId = route.params?.pointId;
  const targetNavigationPointId = route.params?.targetNavigationPointId;
  const requestedTransportMode = route.params?.transportMode;
  const navigationRequestId = route.params?.navigationRequestId;
  const isFocused = useIsFocused();

  // Map states
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef<NHSMapRef>(null);
  const navigationStepsSheetRef = useRef<BottomSheet>(null);
  const [navigationStepsSheetIndex, setNavigationStepsSheetIndex] = useState(-1);
  const [activePoint, setActivePoint] = useState<MapPointCheckin | null>(null);
  const [selectedTravelMode, setSelectedTravelMode] = useState<TravelMode>(MAP_CONSTANTS.DEFAULT_TRAVEL_MODE);
  const [confirmedTravelMode, setConfirmedTravelMode] = useState<TravelMode | null>(null);
  const [isTransportSelectorVisible, setIsTransportSelectorVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { fetchDirectionsWithCache } = useDirectionsCacheClient();

  const { filters: markerFilters, setShowAll, toggleFilter } = useMapMarkerFilters();

  // Modal helpers
  const { alert } = useModal();

  const userLocationOptions = useMemo(
    () => ({
      autoStart: true,
      updateInterval: MAP_CONSTANTS.UPDATE_USER_LOCATION_THROTTLE_MS,
      accuracy: LocationAccuracy.High,
    }),
    []
  );

  // User location tracking - auto-start on mount
  const {
    location: userLocation,
    previousLocation,
    isTracking,
    permissionStatus,
    isLoading: isLocationLoading,
    startTracking,
    stopTracking,
    requestPermission,
    syncNearbyGeofences,
  } = useUserLocation(userLocationOptions);

  const { data: mapPoints = mapData.mapPoints, isError: isMapPointsError } = useQuery({
    queryKey: ['mapPoints'],
    queryFn: async () => {
      const res = await mapService.getMapPoints();
      return res.data as MapPoint[];
    },
    enabled: true,
  });

  if (isMapPointsError) {
    logger.error('[MapScreen] Failed to fetch map points, using default map points.');
  }

  // Auto-focus on a point if navigated with a pointId
  useEffect(() => {
    if (!initialPointId || mapPoints.length === 0) return;

    const targetPoint = mapPoints.find((p) => p.id === initialPointId);

    if (targetPoint) {
      logger.info('[MapScreen] Auto-focusing on point:', targetPoint.name);
      setSelectedPoint(targetPoint);
      setModalVisible(true);

      setTimeout(() => {
        mapRef.current?.animateToCoordinate(
          {
            latitude: parseFloatOrDefault(targetPoint.latitude, 0),
            longitude: parseFloatOrDefault(targetPoint.longitude, 0),
            latDelta: 0.001,
            lngDelta: 0.001,
          },
          600
        );
      }, 500);
    }
  }, [initialPointId, mapPoints]);

  const clearTargetNavigationParam = useCallback(() => {
    navigation.setParams({
      targetNavigationPointId: undefined,
      transportMode: undefined,
      navigationRequestId: undefined,
    });
  }, [navigation]);

  const activeGuidanceTargetPointId = confirmedTravelMode ? targetNavigationPointId : undefined;

  const navigationTargetPoint = useMemo(() => {
    if (!targetNavigationPointId) {
      return null;
    }

    return mapPoints.find((point) => point.id === targetNavigationPointId) ?? null;
  }, [mapPoints, targetNavigationPointId]);

  const previewOrigin = useMemo(() => {
    if (!userLocation) {
      return null;
    }

    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };
  }, [userLocation]);

  const previewDestination = useMemo(() => {
    if (!navigationTargetPoint) {
      return null;
    }

    const latitude = parseFloatOrDefault(navigationTargetPoint.latitude, NaN);
    const longitude = parseFloatOrDefault(navigationTargetPoint.longitude, NaN);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return null;
    }

    return {
      latitude,
      longitude,
    };
  }, [navigationTargetPoint]);

  const previewParams = useMemo(() => {
    if (!previewOrigin || !previewDestination) {
      return null;
    }

    return {
      origin: previewOrigin,
      destination: previewDestination,
      travelMode: selectedTravelMode,
    };
  }, [previewDestination, previewOrigin, selectedTravelMode]);

  const shouldFetchPreviewRoute = Boolean(targetNavigationPointId && isTransportSelectorVisible && previewParams);

  const previewRouteQuery = useDirectionsPreview(previewParams, shouldFetchPreviewRoute);

  const previewRouteSummary = previewRouteQuery.data ?? null;
  const previewRouteLeg = previewRouteSummary?.routes?.[0]?.legs?.[0];

  const previewDistanceText = useMemo(() => {
    return formatDistanceText(previewRouteLeg?.distanceMeters);
  }, [previewRouteLeg?.distanceMeters]);

  const previewDurationText = useMemo(() => {
    return formatDurationText(previewRouteLeg?.duration);
  }, [previewRouteLeg?.duration]);

  const previewErrorMessage = useMemo(() => {
    if (targetNavigationPointId && !previewOrigin) {
      return 'Enable location access to preview available routes.';
    }

    if (targetNavigationPointId && !previewDestination) {
      return 'Unable to read destination coordinates for this point.';
    }

    if (previewRouteQuery.isError) {
      return 'Failed to load route preview. Please try again.';
    }

    return null;
  }, [previewDestination, previewOrigin, previewRouteQuery.isError, targetNavigationPointId]);

  const canStartGuidance =
    Boolean(previewRouteSummary?.routes?.[0]?.legs?.[0]) && !previewRouteQuery.isFetching && !previewErrorMessage;

  const activeTravelModeLabel = useMemo(() => {
    return MAP_CONSTANTS.TRAVEL_MODE_LABELS[confirmedTravelMode ?? selectedTravelMode];
  }, [confirmedTravelMode, selectedTravelMode]);

  const handleTravelModeSelection = useCallback((mode: TravelMode) => {
    setSelectedTravelMode(mode);
  }, []);

  const handleCancelTransportSelection = useCallback(() => {
    setConfirmedTravelMode(null);
    setIsTransportSelectorVisible(false);
    clearTargetNavigationParam();
  }, [clearTargetNavigationParam]);

  const handleStartNavigationWithSelectedMode = useCallback(async () => {
    if (!previewParams) {
      alert('Navigation Unavailable', 'Route preview is not ready yet. Please wait a moment.');
      return;
    }

    try {
      await fetchDirectionsWithCache(previewParams);
      setConfirmedTravelMode(selectedTravelMode);
      setIsTransportSelectorVisible(false);
    } catch (error) {
      logger.error('[MapScreen] Failed to start navigation with selected transport mode', error);
      alert('Navigation Unavailable', 'Failed to load this route mode. Please try again.');
    }
  }, [alert, fetchDirectionsWithCache, previewParams, selectedTravelMode]);

  const {
    isGuidanceMode,
    isDirectionsLoading,
    isDirectionsReady,
    directionError,
    routeSummary,
    navigationSteps,
    currentUserStepIndex,
    onMapReady,
    handleExitGuidance,
    navigationEndpoints,
    isUserArrived,
    currentNavigationStepData,
  } = useMapNavigationGuidance({
    targetNavigationPointId: activeGuidanceTargetPointId,
    travelMode: confirmedTravelMode ?? selectedTravelMode,
    mapPoints,
    userLocation,
    permissionStatus,
    isTracking,
    startTracking,
    alert,
    clearTargetNavigationParam,
  });

  const displayedRouteSummary = useMemo(() => {
    if (isTransportSelectorVisible) {
      return previewRouteSummary;
    }

    return routeSummary;
  }, [isTransportSelectorVisible, previewRouteSummary, routeSummary]);

  const mapPolylineCoordinates = useMemo(() => {
    if (!isGuidanceMode && !isTransportSelectorVisible) {
      return [];
    }

    const encodedPolyline = displayedRouteSummary?.routes?.[0]?.polyline?.encodedPolyline;
    if (!encodedPolyline) {
      return [];
    }

    return decodeRoutePolyline(encodedPolyline);
  }, [displayedRouteSummary, isGuidanceMode, isTransportSelectorVisible]);

  useEffect(() => {
    if (!targetNavigationPointId) {
      setConfirmedTravelMode(null);
      setIsTransportSelectorVisible(false);
      return;
    }

    setSelectedTravelMode(requestedTransportMode ?? MAP_CONSTANTS.DEFAULT_TRAVEL_MODE);
    setConfirmedTravelMode(null);
    setIsTransportSelectorVisible(true);
  }, [requestedTransportMode, targetNavigationPointId]);

  // Use a ref so the cleanup/effect can read the latest tracking state
  // without depending on it (which would cause the infinite loop).
  const isTrackingRef = useRef(isTracking);
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  // Stop tracking when screen loses focus; restart is handled by autoStart on re-focus
  useEffect(() => {
    if (!isFocused && isTrackingRef.current) {
      stopTracking();
    }
  }, [isFocused, stopTracking]);

  const handleMarkerPress = useCallback((point: MapPoint) => {
    setSelectedPoint(point);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleNavigate = useCallback(
    (point: MapPoint) => {
      if (point.id && point.id !== 'offline') {
        if (point.type === 'EVENT') {
          navigation.navigate('EventDetail', { eventId: point.id });
        } else if (point.type === 'WORKSHOP') {
          navigation.navigate('WorkshopDetail', { workshopId: point.id });
        } else if (point.type === 'CHECKIN') {
          if (point.id) {
            navigation.navigate('PointDetail', { pointId: point.id });
          } else {
            alert('Details Unavailable', 'This check-in point is not linked to a parent point.');
          }
        } else {
          navigation.navigate('PointDetail', { pointId: point.id });
        }
      } else {
        alert('Navigation Unavailable', 'Please connect to the internet to access this feature.');
      }
      setModalVisible(false);
    },
    [alert, navigation]
  );
  // Auto request permission on mount if not granted or denied
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const handleOpenCheckinCamera = useCallback(() => {
    if (!isAuthenticated) {
      navigation.getParent()?.getParent()?.navigate('Auth', { screen: 'Login' });
      return;
    }

    navigation.navigate('CheckinCamera', {
      pointId: activePoint?.id,
      pointName: activePoint?.name ?? '',
    });
  }, [activePoint, isAuthenticated, navigation]);

  const canOpenNavigationSteps = isDirectionsReady && navigationSteps.length > 0;
  const isMapInteractionEnabled = navigationStepsSheetIndex !== MAP_CONSTANTS.FULL_SCREEN_SHEET_INDEX;

  const handleOpenNavigationSteps = useCallback(() => {
    if (!canOpenNavigationSteps) {
      return;
    }

    navigationStepsSheetRef.current?.snapToIndex(0);
  }, [canOpenNavigationSteps]);

  const handleCloseNavigationSteps = useCallback(() => {
    navigationStepsSheetRef.current?.close();
  }, []);

  const handleNavigationStepsSheetChange = useCallback((index: number) => {
    setNavigationStepsSheetIndex(index);
  }, []);

  useEffect(() => {
    if (!isGuidanceMode || isUserArrived) {
      handleCloseNavigationSteps();
      setNavigationStepsSheetIndex(-1);
    }
  }, [handleCloseNavigationSteps, isGuidanceMode, isUserArrived]);

  // Auto fit the screen to the full route when directions are ready
  useEffect(() => {
    if (!isGuidanceMode || !targetNavigationPointId || !isDirectionsReady || !navigationEndpoints) {
      return;
    }

    mapRef.current?.fitToCoordinates(
      [navigationEndpoints.origin, navigationEndpoints.destination],
      {
        top: 160,
        right: 64,
        bottom: 180,
        left: 64,
      },
      true
    );
  }, [isGuidanceMode, targetNavigationPointId, isDirectionsReady, navigationEndpoints, mapRef]);

  function onNavigationExit(): void {
    handleCloseNavigationSteps();
    setNavigationStepsSheetIndex(-1);
    setConfirmedTravelMode(null);
    handleExitGuidance();
    mapRef.current?.reloadMap();
  }

  return (
    <ScreenLayout showBackButton={false}>
      {/* Main map */}
      <NHSMap
        ref={mapRef}
        onMarkerPress={handleMarkerPress}
        selectedPointId={selectedPoint?.id ?? ''}
        mapPoints={mapPoints}
        userLocation={userLocation}
        previousLocation={previousLocation}
        syncNearbyGeofences={syncNearbyGeofences}
        onActiveCheckinPointChange={setActivePoint}
        isLocationLoading={isLocationLoading}
        startTrackingCallback={startTracking}
        onMapReadyCallback={onMapReady}
        navigationPolylineCoordinates={mapPolylineCoordinates}
        isGuidanceMode={isGuidanceMode}
        isMapInteractionEnabled={isMapInteractionEnabled}
        markerFilters={markerFilters}
      />

      {!isGuidanceMode && !isTransportSelectorVisible ? (
        <MapMarkerFilterBar
          filters={markerFilters}
          onToggleShowAll={() => setShowAll(true)}
          onToggleFilter={toggleFilter}
          topInset={insets.top}
        />
      ) : null}

      <NavigationGuideOverlay
        visible={isGuidanceMode}
        isLoading={isDirectionsLoading}
        isReady={isDirectionsReady}
        errorMessage={directionError}
        travelModeLabel={activeTravelModeLabel}
        onExit={onNavigationExit}
        onOpenSteps={handleOpenNavigationSteps}
        canOpenSteps={canOpenNavigationSteps}
        currentNavigationStepData={currentNavigationStepData}
        isUserArrived={isUserArrived}
      />

      <TransportModeSelectorSheet
        visible={isTransportSelectorVisible}
        selectedMode={selectedTravelMode}
        destinationName={navigationTargetPoint?.name}
        previewDistanceText={previewDistanceText}
        previewDurationText={previewDurationText}
        isLoading={previewRouteQuery.isFetching}
        errorMessage={previewErrorMessage}
        canStartNavigation={canStartGuidance}
        onSelectMode={handleTravelModeSelection}
        onStartNavigation={handleStartNavigationWithSelectedMode}
        onCancel={handleCancelTransportSelection}
      />

      {isGuidanceMode ? (
        <NavigationStepsBottomSheet
          ref={navigationStepsSheetRef}
          steps={navigationSteps}
          currentStepIndex={currentUserStepIndex}
          onChange={handleNavigationStepsSheetChange}
        />
      ) : null}

      {/* Point detail modal */}
      {!isGuidanceMode && !isTransportSelectorVisible ? (
        <>
          <MapPointDetailModal
            point={selectedPoint}
            visible={modalVisible}
            onClose={handleCloseModal}
            onViewDetails={handleNavigate}
          />
          <CheckinCameraButton onOpenCamera={handleOpenCheckinCamera} isSugestingCheckin={activePoint != null} />
        </>
      ) : null}
    </ScreenLayout>
  );
}
