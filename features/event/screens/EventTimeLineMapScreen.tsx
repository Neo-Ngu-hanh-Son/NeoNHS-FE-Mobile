import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import FullScreenError from '@/components/Loader/FullScreenError';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';
import {
  MapPoint,
  NHSMap,
  NHSMapRef,
  PolylineCoordinate,
  useMapNavigationGuidance,
  useUserLocation,
} from '@/features/map';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useMapCameraController } from '@/features/map/hooks/MapCamera/useMapCameraController';
import { LocationAccuracy } from 'expo-location';
import BottomSheet from '@gorhom/bottom-sheet';
import { decodeRoutePolyline } from '@/features/map/helpers';
import {
  NavigationGuideOverlay,
  NavigationStepsBottomSheet,
  TransportModeSelectorSheet,
} from '@/features/map/components';
import { useMapNavigationPreviewController } from '@/features/map/hooks/Navigation/useMapNavigationPreviewController';
import { useMapScreenController } from '@/features/map/hooks/useMapScreenController';
import { Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { useModal } from '@/app/providers/ModalProvider';
import { logger } from '@/utils/logger';
import { useEventPointTags } from '../hooks/useEventPointTags';
import { useEventTimelineMapController } from '../hooks/useEventTimelineMapController';
import { useEventTimelinesGrouped } from '../hooks/useEventTimelinesGrouped';
import { EventTimelineMapOverlay, EventTimelinePointDetailBottomSheet, EventTimelineListBottomSheet } from '../components';
import { buildEventMapPointsFromGroups } from '../utils/helpers';
import { useEventMapStore } from '../hooks/useEventMapStore';
import { EventMapPoint } from '../types';
import EventTimelineMapMarker from '../components/EventTimelineMapMarker';
import type { EventTimelinePointDetailSheetRef } from '../components/EventTimelinePointDetailBottomSheet';
import type { EventTimelineListSheetRef } from '../components/EventTimelineListBottomSheet';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { List } from 'lucide-react-native';

type EventTimeLineMapScreenProps = StackScreenProps<MainStackParamList, 'EventTimeLineMap'>;

export default function EventTimeLineMapScreen({ navigation, route }: EventTimeLineMapScreenProps) {
  const { eventId, pointId: initialPointId, targetNavigationPointId } = route.params;
  const [manualTargetNavigationPointId, setManualTargetNavigationPointId] = useState<string | undefined>(undefined);
  const effectiveTargetNavigationPointId = manualTargetNavigationPointId ?? targetNavigationPointId;

  const viewMode = useEventMapStore((state) => state.viewMode);
  const setViewMode = useEventMapStore((state) => state.setViewMode);
  const setIsMapReady = useEventMapStore((state) => state.setIsMapReady);
  const isMapReady = useEventMapStore((state) => state.isMapReady);

  const mapRef = useRef<NHSMapRef>(null);
  const navigationStepsSheetRef = useRef<BottomSheet>(null);
  const pointDetailSheetRef = useRef<EventTimelinePointDetailSheetRef>(null);
  const timelineListSheetRef = useRef<EventTimelineListSheetRef>(null);
  const { alert } = useModal();

  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const groupedTimelineQuery = useEventTimelinesGrouped(eventId);
  const groupedTimelines = useMemo(() => groupedTimelineQuery.data ?? [], [groupedTimelineQuery.data]);
  const pointTagQuery = useEventPointTags(eventId, groupedTimelines);

  const fitVisiblePoints = useCallback(
    (points: EventMapPoint[]) => {
      if (!isMapReady || !mapRef.current) {
        return;
      }

      const coordinates = points
        .map((point) => ({ latitude: point.latitude, longitude: point.longitude }))
        .filter(
          (coordinate) =>
            Number.isFinite(coordinate.latitude) &&
            Number.isFinite(coordinate.longitude) &&
            coordinate.latitude !== -1 &&
            coordinate.longitude !== -1
        );

      if (coordinates.length === 0) {
        return;
      }

      if (coordinates.length === 1) {
        mapRef.current.animateToCoordinate(
          {
            latitude: coordinates[0].latitude,
            longitude: coordinates[0].longitude,
            latDelta: 0.005,
            lngDelta: 0.005,
          },
          550
        );
        return;
      }

      mapRef.current.fitToCoordinates(coordinates, {
        top: 220,
        right: 64,
        bottom: 220,
        left: 64,
      });
    },
    [isMapReady]
  );

  const timelineController = useEventTimelineMapController({
    groupedTimelines,
    pointTags: pointTagQuery.data,
    isMapReady,
    onFitVisiblePoints: fitVisiblePoints,
  });

  const mapPoints = useMemo(() => {
    const activeGroup =
      groupedTimelines.find((group) => group.date === timelineController.selectedDate) ?? groupedTimelines[0];
    if (!activeGroup) {
      return [] as EventMapPoint[];
    }

    let points = buildEventMapPointsFromGroups([activeGroup]);

    if (timelineController.activeTagId !== timelineController.allTagId) {
      points = points.filter((point) => point.eventPointTag?.id === timelineController.activeTagId);
    }

    return points;
  }, [groupedTimelines, timelineController.activeTagId, timelineController.allTagId, timelineController.selectedDate]);

  // Search results are used only for the dropdown list, not to filter map markers
  const searchResults = timelineController.searchResults;

  const {
    location: userLocation,
    previousLocation,
    isTracking,
    permissionStatus,
    isLoading: isLocationLoading,
    startTracking,
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
    fitCameraToCoordinates,
    focusOnPoint,
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

  const handleNavigateFromCurrentLocation = useCallback((point: EventMapPoint) => {
    if (!point.id) {
      return;
    }

    pointDetailSheetRef.current?.dismiss();
    setManualTargetNavigationPointId(point.id);
  }, []);

  const renderTimelineMarker = useCallback(
    (point: MapPoint, shouldDisplayMarkerName: boolean) => {
      const eventPoint = point as EventMapPoint;

      return (
        <EventTimelineMapMarker
          key={eventPoint.id}
          point={eventPoint}
          showName={shouldDisplayMarkerName}
          disabled={viewMode === 'NAVIGATING'}
          onPress={handleOpenPointSheetModal}
        />
      );
    },
    [handleOpenPointSheetModal, viewMode]
  );

  const handleSelectSearchResult = useCallback(
    (point: EventMapPoint) => {
      Keyboard.dismiss();
      handleOpenPointSheetModal(point);
      focusOnPoint(point);
      timelineController.clearSearch();
    },
    [focusOnPoint, handleOpenPointSheetModal, timelineController]
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
  const showInitialTimelineLoader = groupedTimelineQuery.isLoading && groupedTimelines.length === 0;
  const showInitialTimelineError = groupedTimelineQuery.isError && groupedTimelines.length === 0;

  useEffect(() => {
    if (viewMode !== 'EXPLORING') {
      timelineController.clearSearch();
    }
  }, [timelineController, viewMode]);

  useEffect(() => {
    if (!groupedTimelineQuery.isError) {
      return;
    }

    logger.error('[EventTimeLineMapScreen] Failed to load grouped timeline', groupedTimelineQuery.error);
  }, [groupedTimelineQuery.error, groupedTimelineQuery.isError]);

  useEffect(() => {
    return () => {
      setViewMode('EXPLORING');
      setIsMapReady(false);
    };
  }, [setIsMapReady, setViewMode]);

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

  if (showInitialTimelineLoader) {
    return <FullScreenLoader message="Loading timeline map..." />;
  }

  if (showInitialTimelineError) {
    return (
      <FullScreenError
        message="Failed to load timeline data. Pull down or tap retry."
        onRetry={async () => {
          await groupedTimelineQuery.refetch();
        }}
      />
    );
  }

  const shouldShowBackButton = viewMode === 'EXPLORING';
  return (
    <ScreenLayout showBackButton={shouldShowBackButton}>
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
        renderMarker={renderTimelineMarker}
      />

      {viewMode === 'EXPLORING' && (
        <>
          <EventTimelineMapOverlay
            topInset={controller.insets.top}
            showBackButton={shouldShowBackButton}
            searchValue={timelineController.searchText}
            onSearchChange={timelineController.setSearchText}
            onClearSearch={timelineController.clearSearch}
            onSelectSearchResult={handleSelectSearchResult}
            searchResults={searchResults}
            isSearching={timelineController.isSearching}
            dayOptions={timelineController.dayOptions}
            selectedDate={timelineController.selectedDate}
            onSelectDate={timelineController.setSelectedDate}
            tagOptions={timelineController.tagOptions}
            activeTagId={timelineController.activeTagId}
            onSelectTag={timelineController.setActiveTagId}
          />

          {/* ── Floating Schedule button (bottom center) ── */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => timelineListSheetRef.current?.present()}
            style={[
              floatingStyles.scheduleBtn,
              {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
              },
            ]}
            accessibilityLabel="View schedule for this day"
          >
            <List size={18} color="#fff" />
            <Text style={floatingStyles.scheduleBtnText}>Schedule</Text>
          </TouchableOpacity>

          <EventTimelinePointDetailBottomSheet
            ref={pointDetailSheetRef}
            point={controller.selectedPoint as EventMapPoint | null}
            onAfterClose={controller.handlePointSheetClosed}
            onNavigateFromCurrentLocation={handleNavigateFromCurrentLocation}
          />
          <EventTimelineListBottomSheet
            ref={timelineListSheetRef}
            points={mapPoints}
            selectedDateLabel={
              timelineController.dayOptions.find((d) => d.date === timelineController.selectedDate)?.label ??
              'Schedule'
            }
            onFocusPoint={(point) => {
              focusOnPoint(point);
              handleOpenPointSheetModal(point);
            }}
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

const floatingStyles = StyleSheet.create({
  scheduleBtn: {
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  scheduleBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
