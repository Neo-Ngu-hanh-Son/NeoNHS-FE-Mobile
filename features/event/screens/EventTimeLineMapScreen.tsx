import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import {
  EventMapPoint,
  MapPoint,
  NHSMap,
  NHSMapRef,
  PolylineCoordinate,
  useMapNavigationGuidance,
  useMapSearch,
  useUserLocation,
} from '@/features/map';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useMapCameraController } from '@/features/map/hooks/MapCamera/useMapCameraController';
import { useMapStore } from '@/features/map/store/useMapStore';
import { LocationAccuracy } from 'expo-location';
import { useEventDetail } from '../hooks/useEventDetail';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import BottomSheet from '@gorhom/bottom-sheet';
import { decodeRoutePolyline } from '@/features/map/helpers';
import {
  MapSearchBar,
  NavigationGuideOverlay,
  NavigationStepsBottomSheet,
  TransportModeSelectorSheet,
} from '@/features/map/components';
import MapPointDetailModal, {
  MapPointDetailSheetRef,
} from '@/features/map/components/PointDetailModal/PointDetailModal';
import { useMapNavigationPreviewController } from '@/features/map/hooks/Navigation/useMapNavigationPreviewController';
import { useMapScreenController } from '@/features/map/hooks/useMapScreenController';
import { Keyboard } from 'react-native';
import { useModal } from '@/app/providers/ModalProvider';
import { logger } from '@/utils/logger';

type EventTimeLineMapScreenProps = StackScreenProps<MainStackParamList, 'EventTimeLineMap'>;

export default function EventTimeLineMapScreen({ navigation, route }: EventTimeLineMapScreenProps) {
  const { eventId, pointId: initialPointId, targetNavigationPointId } = route.params;

  const viewMode = useMapStore((state) => state.viewMode);
  const setViewMode = useMapStore((state) => state.setViewMode);
  const setIsMapReady = useMapStore((state) => state.setIsMapReady);
  const isMapReady = useMapStore((state) => state.isMapReady);

  const mapRef = useRef<NHSMapRef>(null);
  const navigationStepsSheetRef = useRef<BottomSheet>(null);
  const pointDetailSheetRef = useRef<MapPointDetailSheetRef>(null);
  const { alert } = useModal();

  const { data: eventDetail } = useEventDetail(eventId);

  const mapPoints = useMemo<EventMapPoint[]>(() => {
    if (!eventDetail) {
      return [];
    }

    const latitude = parseFloatOrDefault(eventDetail.latitude ?? '', -1);
    const longitude = parseFloatOrDefault(eventDetail.longitude ?? '', -1);
    const primaryTag = eventDetail.tags?.[0];

    return [
      {
        id: eventDetail.id,
        name: eventDetail.name,
        description: eventDetail.shortDescription ?? eventDetail.fullDescription ?? undefined,
        shortDescription: eventDetail.shortDescription ?? undefined,
        thumbnailUrl: eventDetail.thumbnailUrl ?? undefined,
        latitude,
        longitude,
        type: 'EVENT',
        startTime: eventDetail.startTime ?? undefined,
        endTime: eventDetail.endTime ?? undefined,
        maxParticipants: eventDetail.maxParticipants ?? undefined,
        currentEnrolled: eventDetail.currentEnrolled ?? undefined,
        eventPointTag: {
          name: primaryTag?.name ?? 'Event',
          description: primaryTag?.description,
          color: primaryTag?.tagColor,
          iconUrl: primaryTag?.iconUrl,
        },
      },
    ];
  }, [eventDetail]);

  const {
    location: userLocation,
    previousLocation,
    isTracking,
    permissionStatus,
    isLoading: isLocationLoading,
    startTracking,
    requestPermission,
  } = useUserLocation({
    autoStart: true,
    accuracy: LocationAccuracy.High,
  });

  const controller = useMapScreenController({ navigation, pointDetailSheetRef });

  const handleOpenPointSheetModal = useCallback(
    (point: MapPoint) => {
      controller.handleMarkerPress(point);
      pointDetailSheetRef.current?.present();
    },
    [controller]
  );

  const handleOnMapReady = useCallback(() => {
    logger.debug('[EventTimeLineMapScreen] Map is ready.');
    setIsMapReady(true);
  }, [setIsMapReady]);

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
    setViewMode,
    mapRef,
    mapIsReady: isMapReady,
    fitCameraToCoordinates,
    focusOnPoint,
  });

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

  const { searchText, setSearchText, clearSearch, isSearching, filteredResults } = useMapSearch(mapPoints);

  const handleSelectSearchResult = useCallback(
    (point: EventMapPoint) => {
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

    return previewRouteSummary?.routes?.[0]?.polyline?.encodedPolyline ?? '';
  }, [previewRouteSummary?.routes, viewMode]);

  const navigationPolylineCoordinates = useMemo(() => {
    return decodeRoutePolyline(memorizedEncodedPolyline);
  }, [memorizedEncodedPolyline]);

  const displayCoordinates = useMemo(() => {
    if (navigationPolylineCoordinates.length >= 2) {
      lastValidRouteRef.current = navigationPolylineCoordinates;
      return navigationPolylineCoordinates;
    }

    return lastValidRouteRef.current ?? [];
  }, [navigationPolylineCoordinates]);

  const isNavPolylineVisible = navigationPolylineCoordinates.length >= 2;

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
    logger.debug('[EventTimeLineMapScreen] Closing navigation steps sheet');
    navigationStepsSheetRef.current?.close();
  }, []);

  const onNavigationExit = useCallback(() => {
    logger.debug('[EventTimeLineMapScreen] Exiting navigation');
    handleCloseNavigationSteps();
    setConfirmedTravelMode(null);
    handleExitGuidance();
  }, [handleCloseNavigationSteps, handleExitGuidance, setConfirmedTravelMode]);

  return (
    <ScreenLayout showBackButton={false}>
      <NHSMap
        ref={mapRef}
        onMarkerPress={handleOpenPointSheetModal}
        selectedPointId={controller.selectedPoint?.id ?? ''}
        navigationPolylineCoordinates={displayCoordinates}
        isNavPolylineVisible={isNavPolylineVisible}
        isMapInteractionEnabled={true}
        viewMode={viewMode}
        mapPoints={mapPoints}
        userLocation={userLocation}
        previousLocation={previousLocation}
        syncNearbyGeofences={undefined}
        onActiveCheckinPointChange={undefined}
        isLocationLoading={isLocationLoading}
        startTrackingCallback={startTracking}
        onMapReadyCallback={handleOnMapReady}
        enableCheckinMode={false}
      />

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
          <MapPointDetailModal
            ref={pointDetailSheetRef}
            point={controller.selectedPoint}
            onClose={handleClosePointSheetModal}
            onAfterClose={controller.handlePointSheetClosed}
            onViewDetails={controller.handleNavigate}
          />
        </>
      )}

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
          />
        </>
      )}
    </ScreenLayout>
  );
}
