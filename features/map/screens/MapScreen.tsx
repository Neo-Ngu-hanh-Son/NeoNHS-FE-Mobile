import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { logger } from '@/utils/logger';
import { MapPoint, PolylineCoordinate } from '../types';
import MapPointDetailModal from '../components/PointDetailModal/PointDetailModal';
import type { MapPointDetailSheetRef } from '../components/PointDetailModal/PointDetailModal';
import { NHSMap } from '../components/Map/NHSMap';
import NavigationGuideOverlay from '../components/Navigation/NavigationGuideOverlay';
import { MapMarkerFilterBar, MapSearchBar, TransportModeSelectorSheet, NHSMapRef } from '../components';
import { mapService } from '../services/mapServices';
import { useModal } from '@/app/providers/ModalProvider';
import { useMapMarkerFilters, useMapNavigationGuidance, useMapSearch, useUserLocation } from '../hooks';
import { mapData } from '../data';
import { CompositeScreenProps } from '@react-navigation/native';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { useQuery } from '@tanstack/react-query';
import CheckinCameraButton from '../components/Camera/CheckinCameraButton';
import MAP_CONSTANTS from '../constants';
import { LocationAccuracy } from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import NavigationStepsBottomSheet from '../components/Navigation/NavigationStepsBottomSheet';
import { decodeRoutePolyline } from '../helpers';
import { useMapStore } from '../store/useMapStore';
import { useMapNavigationPreviewController } from '../hooks/Navigation/useMapNavigationPreviewController';
import { QUERY_KEYS } from '@/services/api/tanstack/queryKeyConstants';
import { useMapCameraController } from '../hooks/MapCamera/useMapCameraController';
import { useMapScreenController } from '../hooks/useMapScreenController';

type MapScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Map'>,
  StackScreenProps<MainStackParamList>
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
  const [manualTargetNavigationPointId, setManualTargetNavigationPointId] = useState<string | undefined>(undefined);
  const effectiveTargetNavigationPointId = manualTargetNavigationPointId ?? targetNavigationPointId;

  // Zustand store for managing map-wide states like view mode
  const viewMode = useMapStore((state) => state.viewMode);
  const setViewMode = useMapStore((state) => state.setViewMode);
  const setIsMapReady = useMapStore((state) => state.setIsMapReady);
  const isMapReady = useMapStore((state) => state.isMapReady);

  // Map states
  const mapRef = useRef<NHSMapRef>(null);
  const navigationStepsSheetRef = useRef<BottomSheet>(null);
  const pointDetailSheetRef = useRef<MapPointDetailSheetRef>(null);

  const { alert } = useModal();

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
    clearTargetNavigationParam: clearTargetNavigationParamAuto,
    handleTravelModeSelection,
    handleCancelTransportSelection: handleCancelTransportSelectionAuto,
    setConfirmedTravelMode,
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

  const clearTargetNavigationParam = useCallback(() => {
    setManualTargetNavigationPointId(undefined);
    clearTargetNavigationParamAuto();
  }, [clearTargetNavigationParamAuto]);

  const handleCancelTransportSelection = useCallback(() => {
    setManualTargetNavigationPointId(undefined);
    handleCancelTransportSelectionAuto();
  }, [handleCancelTransportSelectionAuto]);

  const {
    directionError,
    navigationSteps,
    currentUserStepIndex,
    handleExitGuidance,
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
    previewRouteSummary,
    previewErrorMessage,
    viewMode,
  });

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

  const lastValidRouteRef = useRef<PolylineCoordinate[] | null>(null);
  const memorizedEncodedPolyline = useMemo(() => {
    if (viewMode === 'EXPLORING') {
      return '';
    }
    if (!previewRouteSummary?.routes?.[0]?.polyline?.encodedPolyline) {
      return '';
    }

    return previewRouteSummary?.routes?.[0]?.polyline?.encodedPolyline;
  }, [previewRouteSummary?.routes, viewMode]);

  const navigationPolylineCoordinates = useMemo(() => {
    const decoded = decodeRoutePolyline(memorizedEncodedPolyline);
    return decoded;
  }, [memorizedEncodedPolyline]);

  const displayCoordinates = useMemo(() => {
    if (navigationPolylineCoordinates && navigationPolylineCoordinates.length >= 2) {
      lastValidRouteRef.current = navigationPolylineCoordinates;
      return navigationPolylineCoordinates;
    }

    return lastValidRouteRef.current ?? [];
  }, [navigationPolylineCoordinates]);
  const isNavPolylineVisible = !!(navigationPolylineCoordinates && navigationPolylineCoordinates.length >= 2);

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

  function onNavigationExit(): void {
    logger.debug('Exiting navigation');
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
        isNavPolylineVisible={isNavPolylineVisible}
        isMapInteractionEnabled={true}
        markerFilters={markerFilters}
        enableCheckinMode={true}
        viewMode={viewMode}
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
          onCancel={handleCancelTransportSelection}
        />
      )}

      {/* Navigation Mode */}
      {viewMode === 'NAVIGATING' && (
        <>
          <NavigationGuideOverlay
            isLoading={navigationSteps == null || navigationSteps.length === 0}
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
