import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, BackHandler } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { logger } from '@/utils/logger';
import { MapPoint, TravelMode } from '../types';
import MapPointDetailModal from '../components/PointDetailModal/PointDetailModal';
import type { MapPointDetailSheetRef } from '../components/PointDetailModal/PointDetailModal';
import { NHSMap } from '../components/Map/NHSMap';
import NavigationGuideOverlay from '../components/Navigation/NavigationGuideOverlay';
import { MapMarkerFilterBar, MapSearchBar, TransportModeSelectorSheet, NHSMapRef } from '../components';
import { mapService } from '../services/mapServices';
import { useMapMarkerFilters, useMapNavigationGuidance, useMapSearch, useUserLocation } from '../hooks';
import { mapData } from '../data';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { useQuery } from '@tanstack/react-query';
import CheckinCameraButton from '../components/CheckinCameraButton';
import MAP_CONSTANTS from '../constants';
import { LocationAccuracy } from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import NavigationStepsBottomSheet from '../components/Navigation/NavigationStepsBottomSheet';
import { useMapStore } from '../store/useMapStore';
import { useMapNavigationPreviewController } from '../hooks/Navigation/useMapNavigationPreviewController';
import { QUERY_KEYS } from '@/services/api/tanstack/queryKeyConstants';
import { useMapCameraController } from '../hooks/MapCamera/useMapCameraController';
import { useMapScreenController } from '../hooks/useMapScreenController';
import { useDynamicPolyline } from '../hooks/Navigation/useDynamicPolyline';

type MapScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Map'>,
  StackScreenProps<MainStackParamList, 'MapDirection'>
>;
export default function MapScreen({ navigation, route }: MapScreenProps) {
  const USER_LOCATION_OPTIONS = useMemo(() => {
    return {
      autoStart: true,
      updateInterval: MAP_CONSTANTS.UPDATE_USER_LOCATION_THROTTLE_MS,
      accuracy: LocationAccuracy.High,
    };
  }, []);

  // Route params
  const initialPointId = route.params?.pointId;
  const targetNavigationPointId = route.params?.targetNavigationPointId;
  const fromChatRoomId = route.params?.fromChatRoomId;
  const [manualTargetNavigationPointId, setManualTargetNavigationPointId] = useState<string | undefined>(undefined);
  const effectiveTargetNavigationPointId = manualTargetNavigationPointId ?? targetNavigationPointId;

  const handleBackToChat = useCallback(() => {
    if (fromChatRoomId) {
      // Clear fromChatRoomId from params so if we come back it doesn't stay
      navigation.setParams({ fromChatRoomId: undefined });
      navigation.navigate('ChatRoom', { roomId: fromChatRoomId });
    }
  }, [navigation, fromChatRoomId]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (fromChatRoomId) {
          handleBackToChat();
          return true; // Prevent default back (which goes to Home)
        }
        return false;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [fromChatRoomId, handleBackToChat])
  );

  // Zustand store for managing map-wide states like view mode
  const viewMode = useMapStore((state) => state.viewMode);
  const setViewMode = useMapStore((state) => state.setViewMode);
  const setIsMapReady = useMapStore((state) => state.setIsMapReady);
  const isMapReady = useMapStore((state) => state.isMapReady);

  // Map states
  const mapRef = useRef<NHSMapRef>(null);
  const navigationStepsSheetRef = useRef<BottomSheet>(null);
  const pointDetailSheetRef = useRef<MapPointDetailSheetRef>(null);

  const { filters: markerFilters, setShowAll, toggleFilter } = useMapMarkerFilters();

  const handleOnMapReady = useCallback(() => {
    logger.debug('Map reported ready state');
    setIsMapReady(true);
  }, [setIsMapReady]);

  // User location tracking - auto-start on mount
  const {
    location: userLocation,
    previousLocation,
    isTracking,
    permissionStatus,
    isLoading: isLocationLoading,
    startTracking,
    requestPermission,
    syncNearbyGeofences,
  } = useUserLocation(USER_LOCATION_OPTIONS);

  const {
    data: mapPoints = mapData.mapPoints,
    isError: isMapPointsError,
    refetch,
  } = useQuery({
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

  const controller = useMapScreenController({ navigation, pointDetailSheetRef });

  const { handleMarkerPress } = controller;

  const handleOpenPointSheetModal = useCallback(
    (point: MapPoint) => {
      handleMarkerPress(point);
      pointDetailSheetRef.current?.present();
    },
    [handleMarkerPress]
  );

  const { focusOnPoint, fitCameraToCoordinates } = useMapCameraController({
    mapRef,
    initialPointId,
    targetNavigationPointId,
    mapPoints,
    handleOpenPointSheet: handleOpenPointSheetModal,
    isMapReady,
  });

  const {
    navigationTargetPoint,
    previewDistanceText,
    previewDurationText,
    previewErrorMessage,
    activeTravelModeLabel,
    previewRouteSummary,
    previewRouteQuery,
    confirmedTravelMode,
    canStartGuidance,
    previewDestination,
    effectiveTravelMode: selectedTravelMode,
    routingSource,
    handleStartNavigationWithSelectedMode,
    clearTargetNavigationParam,
    handleTravelModeSelection,
  } = useMapNavigationPreviewController({
    targetNavigationPointId: effectiveTargetNavigationPointId,
    mapPoints,
    userLocation,
    viewMode,
    navigation,
    setViewMode,
    mapRef,
    mapIsReady: isMapReady,
    focusOnPoint,
    fitCameraToCoordinates,
  });


  const hasValidNavInput =
    userLocation && previewDestination && confirmedTravelMode;

  const {
    directionError,
    navigationSteps,
    currentUserStepIndex,
    handleExitGuidance,
    isUserArrived,
    currentNavigationStepData,
    routeSummary
  } = useMapNavigationGuidance(
    hasValidNavInput
      ? {
        origin: userLocation,
        destination: previewDestination,
        source: routingSource,
        travelMode: confirmedTravelMode,
        userLocation,
        startTracking,
        previewRouteSummary,
        viewMode,
      }
      : ({} as any)
  );

  const handleClosePointSheetModal = useCallback(() => {
    pointDetailSheetRef.current?.dismiss();
  }, []);

  const handleNavigateFromCurrentLocation = useCallback(
    (point: MapPoint) => {
      if (!point.id) {
        return;
      }

      handleClosePointSheetModal();
      setManualTargetNavigationPointId(point.id);
    },
    [handleClosePointSheetModal]
  );

  const { searchText, setSearchText, clearSearch, isSearching, filteredResults } = useMapSearch(mapPoints);

  const handleSelectSearchResult = useCallback(
    (point: MapPoint) => {
      Keyboard.dismiss();
      handleOpenPointSheetModal(point);
      focusOnPoint(point);
      clearSearch();
    },
    [clearSearch, focusOnPoint, handleOpenPointSheetModal]
  );

  const routeToDisplay = viewMode === 'NAVIGATING' ? routeSummary : previewRouteSummary;

  const { displayCoordinates, isDrawingRoute } = useDynamicPolyline({
    userLocation: userLocation,
    animationIntervalMs: 50,
    enableAnimation: true,
    isFetching: previewRouteQuery.isFetching,
    viewMode: viewMode,
    routeSummary: routeToDisplay,
  });

  // const isNavPolylineVisible = !!(navigationPolylineCoordinates && navigationPolylineCoordinates.length >= 2);
  const isNavPolylineVisible = !!(displayCoordinates && displayCoordinates.length >= 2);

  // Auto request permission on mount if not granted or denied
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (viewMode !== 'EXPLORING') {
      clearSearch();
    }
  }, [clearSearch, viewMode]);

  const handleOpenNavigationSteps = useCallback(() => {
    if (viewMode !== 'NAVIGATING') return;
    navigationStepsSheetRef.current?.snapToIndex(0);
  }, [viewMode]);

  const handleCloseNavigationSteps = useCallback(() => {
    logger.debug('Closing navigation steps sheet');
    navigationStepsSheetRef.current?.close();
  }, []);

  const resetAllNavigation = useCallback(() => {
    setManualTargetNavigationPointId(undefined);
    handleCloseNavigationSteps(); // Close the steps sheet
    clearTargetNavigationParam(); // Map preview reset
    handleExitGuidance(); // Guidance reset
    setViewMode('EXPLORING');
    navigation.setParams({
      targetNavigationPointId: undefined,
    });
  }, [clearTargetNavigationParam, handleCloseNavigationSteps, handleExitGuidance, navigation, setViewMode]);

  const excludedModes: TravelMode[] = useMemo(() => {
    return routingSource === 'CUSTOM'
      ? ['BICYCLE', 'TWO_WHEELER', 'DRIVE']
      : [];
  }, [routingSource]);

  return (
    <ScreenLayout showBackButton={!!fromChatRoomId} onBack={handleBackToChat}>
      {/* Main map */}
      <NHSMap
        ref={mapRef}
        onMarkerPress={handleOpenPointSheetModal}
        selectedPointId={controller.selectedPoint?.id ?? ''}
        mapPoints={mapPoints}
        userLocation={userLocation}
        previousLocation={previousLocation}
        syncNearbyGeofences={syncNearbyGeofences}
        onActiveCheckinPointChange={controller.setActivePoint}
        isLocationLoading={isLocationLoading}
        startTrackingCallback={startTracking}
        onMapReadyCallback={handleOnMapReady}
        navigationPolylineCoordinates={displayCoordinates}
        selectedTravelMode={selectedTravelMode ?? MAP_CONSTANTS.DEFAULT_TRAVEL_MODE}
        isNavPolylineVisible={isNavPolylineVisible}
        isMapInteractionEnabled={true}
        markerFilters={markerFilters}
        enableCheckinMode={true}
        viewMode={viewMode}
        refetchMapPoints={refetch}
      />

      {/* Exploring Mode */}
      {viewMode === 'EXPLORING' && (
        <>
          <MapSearchBar
            value={searchText}
            onChangeText={setSearchText}
            onClear={clearSearch}
            onSelectResult={handleSelectSearchResult}
            results={filteredResults}
            isSearching={isSearching}
            topInset={controller.insets.top}
          />
          <MapMarkerFilterBar
            filters={markerFilters}
            onToggleShowAll={() => setShowAll(true)}
            onToggleFilter={toggleFilter}
            topInset={controller.insets.top + 56}
          />
          <MapPointDetailModal
            ref={pointDetailSheetRef}
            point={controller.selectedPoint}
            onClose={handleClosePointSheetModal}
            onAfterClose={controller.handlePointSheetClosed}
            onViewDetails={controller.handleNavigate}
            onNavigateFromCurrentLocation={handleNavigateFromCurrentLocation}
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
          onCancel={resetAllNavigation}
          excludedModes={excludedModes}
        />
      )}

      {/* Navigation Mode */}
      {viewMode === 'NAVIGATING' && (
        <>
          <NavigationGuideOverlay
            isLoading={navigationSteps == null || navigationSteps.length === 0}
            errorMessage={directionError}
            travelModeLabel={activeTravelModeLabel}
            onExit={resetAllNavigation}
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
