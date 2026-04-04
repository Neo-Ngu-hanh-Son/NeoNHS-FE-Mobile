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
import { useDirectionsCacheClient, useMapMarkerFilters, useMapNavigationGuidance, useUserLocation } from '../hooks';
import { mapData } from '../data';
import { CompositeScreenProps, useIsFocused } from '@react-navigation/native';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { useQuery } from '@tanstack/react-query';
import CheckinCameraButton from '../components/Camera/CheckinCameraButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MAP_CONSTANTS from '../constants';
import { LocationAccuracy } from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import NavigationStepsBottomSheet from '../components/Navigation/NavigationStepsBottomSheet';
import { decodeRoutePolyline, formatDistanceText, formatDurationText } from '../helpers';
import { useMapStore } from '../store/useMapStore';
import { useMapNavigationPreviewController } from '../hooks/Navigation/useMapNavigationPreviewController';
import { QUERY_KEYS } from '@/services/api/tanstack/queryKeyConstants';
import { useMapCameraController } from '../hooks/MapCamera/useMapCameraController';
import { useMapScreenController } from '../hooks/useMapScreenController';

const USER_LOCATION_OPTIONS = {
  autoStart: true,
  updateInterval: MAP_CONSTANTS.UPDATE_USER_LOCATION_THROTTLE_MS,
  accuracy: LocationAccuracy.High,
};

type MapScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Map'>,
  StackScreenProps<MainStackParamList>
>;
export default function MapScreen({ navigation, route }: MapScreenProps) {
  // Route params
  const initialPointId = route.params?.pointId;
  const targetNavigationPointId = route.params?.targetNavigationPointId;
  const requestedTransportMode = route.params?.transportMode;
  const navigationRequestId = route.params?.navigationRequestId;

  // Zustand store for managing map-wide states like view mode
  const setViewMode = useMapStore((state) => state.setViewMode);
  const viewMode = useMapStore((state) => state.viewMode);

  // Map states
  const mapRef = useRef<NHSMapRef>(null);
  const navigationStepsSheetRef = useRef<BottomSheet>(null);

  const { alert } = useModal();

  const { filters: markerFilters, setShowAll, toggleFilter } = useMapMarkerFilters();
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
  } = useUserLocation(USER_LOCATION_OPTIONS);

  const { data: mapPoints = mapData.mapPoints, isError: isMapPointsError } = useQuery({
    queryKey: [QUERY_KEYS.MAP_POINTS],
    queryFn: async () => {
      const res = await mapService.getMapPoints();
      return res.data as MapPoint[];
    },
    enabled: true,
  });

  if (isMapPointsError) {
    logger.error('[MapScreen] Failed to fetch map points, using default map points.');
  }

  const controller = useMapScreenController({ navigation });

  const {
    activeGuidanceTargetPointId,
    navigationTargetPoint,
    previewDistanceText,
    previewDurationText,
    previewErrorMessage,
    canStartGuidance,
    activeTravelModeLabel,
    previewRouteSummary,
    previewRouteQuery,
    selectedTravelMode,
    confirmedTravelMode,
    handleStartNavigationWithSelectedMode,
    clearTargetNavigationParam,
    handleTravelModeSelection,
    handleCancelTransportSelection,
    setConfirmedTravelMode,
  } = useMapNavigationPreviewController({
    targetNavigationPointId,
    mapPoints,
    userLocation,
    viewMode,
    navigation,
    requestedTransportMode,
  });

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
    mapPoints,
    userLocation,
    permissionStatus,
    isTracking,
    startTracking,
    alert,
    clearTargetNavigationParam,
    travelMode: confirmedTravelMode,
  });

  const { focusedPoint } = useMapCameraController({
    mapRef,
    initialPointId,
    targetNavigationPointId,
    mapPoints,
    navigationEndpoints,
    isDirectionsReady,
    isGuidanceMode,
  });

  // Auto-focus on a point if navigated with a pointId
  useEffect(() => {
    if (focusedPoint) {
      controller.setSelectedPoint(focusedPoint);
      controller.setModalVisible(true);
    }
  }, [focusedPoint, controller]);

  const displayedRouteSummary = useMemo(() => {
    if (viewMode === 'PREVIEWING_NAVIGATION' && previewRouteSummary) {
      return previewRouteSummary;
    }

    return routeSummary;
  }, [viewMode, previewRouteSummary, routeSummary]);

  const navigationPolylineCoordinates = useMemo(() => {
    if (viewMode === 'EXPLORING') {
      console.log('Not in navigation mode, no polyline to display');
      return [];
    }

    const encodedPolyline = displayedRouteSummary?.routes?.[0]?.polyline?.encodedPolyline;
    if (!encodedPolyline) {
      return [];
    }

    return decodeRoutePolyline(encodedPolyline);
  }, [displayedRouteSummary, viewMode]);

  // Use a ref so the cleanup/effect can read the latest tracking state
  // without depending on it (which would cause the infinite loop).
  const isTrackingRef = useRef(isTracking);
  useEffect(() => {
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  // Stop tracking when screen loses focus; restart is handled by autoStart on re-focus
  useEffect(() => {
    if (!controller.isFocused && isTrackingRef.current) {
      stopTracking();
    }
  }, [controller.isFocused, stopTracking]);

  // Auto request permission on mount if not granted or denied
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const handleOpenNavigationSteps = useCallback(() => {
    if (viewMode !== 'NAVIGATING') return;
    navigationStepsSheetRef.current?.snapToIndex(0);
  }, [viewMode]);

  const handleCloseNavigationSteps = useCallback(() => {
    navigationStepsSheetRef.current?.close();
  }, []);

  useEffect(() => {
    if (!isGuidanceMode || isUserArrived) {
      handleCloseNavigationSteps();
    }
  }, [controller, handleCloseNavigationSteps, isGuidanceMode, isUserArrived]);

  function onNavigationExit(): void {
    handleCloseNavigationSteps();
    setConfirmedTravelMode(null);
    handleExitGuidance();
    // mapRef.current?.reloadMap();
  }

  return (
    <ScreenLayout showBackButton={false}>
      {/* Main map */}
      <NHSMap
        ref={mapRef}
        onMarkerPress={controller.handleMarkerPress}
        selectedPointId={controller.selectedPoint?.id ?? ''}
        mapPoints={mapPoints}
        userLocation={userLocation}
        previousLocation={previousLocation}
        syncNearbyGeofences={syncNearbyGeofences}
        onActiveCheckinPointChange={controller.setActivePoint}
        isLocationLoading={isLocationLoading}
        startTrackingCallback={startTracking}
        onMapReadyCallback={onMapReady}
        navigationPolylineCoordinates={navigationPolylineCoordinates}
        isGuidanceMode={isGuidanceMode}
        isMapInteractionEnabled={true} // TODO: Disable map interaction when the bottom sheet is open in navigation mode
        markerFilters={markerFilters}
      />

      {/* Exploring Mode */}
      {viewMode === 'EXPLORING' && (
        <>
          <MapMarkerFilterBar
            filters={markerFilters}
            onToggleShowAll={() => setShowAll(true)}
            onToggleFilter={toggleFilter}
            topInset={controller.insets.top}
          />
          <MapPointDetailModal
            point={controller.selectedPoint}
            visible={controller.modalVisible}
            onClose={controller.handleCloseModal}
            onViewDetails={controller.handleNavigate}
          />
          <CheckinCameraButton
            onOpenCamera={controller.handleOpenCheckinCamera}
            isSugestingCheckin={controller.activePoint != null}
          />
        </>
      )}

      {/* Preview Navigation Mode */}
      {viewMode === 'PREVIEWING_NAVIGATION' && (
        <TransportModeSelectorSheet
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
      )}

      {/* Navigation Mode */}
      {viewMode === 'NAVIGATING' && (
        <>
          <NavigationGuideOverlay
            isLoading={isDirectionsLoading}
            isReady={isDirectionsReady}
            errorMessage={directionError}
            travelModeLabel={activeTravelModeLabel}
            onExit={onNavigationExit}
            onOpenSteps={handleOpenNavigationSteps}
            currentNavigationStepData={currentNavigationStepData}
            isUserArrived={isUserArrived}
          />
          <NavigationStepsBottomSheet
            ref={navigationStepsSheetRef}
            steps={navigationSteps}
            currentStepIndex={currentUserStepIndex}
            // onChange={handleNavigationStepsSheetChange}
          />
        </>
      )}
    </ScreenLayout>
  );
}
