import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { logger } from '@/utils/logger';
import { MapPoint, MapPointCheckin } from '../types';
import MapPointDetailModal from '../components/PointDetailModal/PointDetailModal';
import NHSMap, { NHSMapRef } from '../components/Map/NHSMap';
import NavigationGuideOverlay from '../components/NavigationGuideOverlay';
import { MapMarkerFilterBar } from '../components';
import { mapService } from '../services/mapServices';
import { useModal } from '@/app/providers/ModalProvider';
import { useMapMarkerFilters, useMapNavigationGuidance, useUserLocation } from '../hooks';
import { LocationPermissionBanner } from '../components/UserLocation';
import { mapData } from '../data';
import { CompositeScreenProps, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { useQuery } from '@tanstack/react-query';
import CheckinCameraButton from '../components/Camera/CheckinCameraButton';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { perfMonitor } from '@/utils/perfMonitor';
import MAP_CONSTANTS from '../constants';

type MapScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Map'>,
  StackScreenProps<MainStackParamList>
>;
export default function MapScreen({ navigation, route }: MapScreenProps) {
  perfMonitor.markRender('Map');

  const { isAuthenticated } = useAuth();
  const initialPointId = route.params?.pointId;
  const targetNavigationPointId = route.params?.targetNavigationPointId;
  const isFocused = useIsFocused();

  // Map state
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef<NHSMapRef>(null);
  const [activePoint, setActivePoint] = useState<MapPointCheckin | null>(null);
  const insets = useSafeAreaInsets();

  const { filters: markerFilters, setShowAll, toggleFilter } = useMapMarkerFilters();


  // Modal helpers
  const { alert } = useModal();
  const userLocationOptions = useMemo(
    () => ({
      autoStart: false,
      updateInterval: MAP_CONSTANTS.UPDATE_USER_LOCATION_THROTTLE_MS,
      distanceInterval: 5,
    }),
    []
  );

  // User location tracking - auto-start on mount
  const {
    location: userLocation,
    previousLocation,
    isTracking,
    permissionStatus,
    error: locationError,
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
    enabled: isFocused,
  });

  useFocusEffect(
    useCallback(() => {
      perfMonitor.markFocus('Map');
      perfMonitor.logSnapshot('focus:Map');

      return () => {
        perfMonitor.markBlur('Map');
        perfMonitor.logSnapshot('blur:Map');
      };
    }, [])
  );

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
    navigation.setParams({ targetNavigationPointId: undefined });
  }, [navigation]);

  const {
    isGuidanceMode,
    isDirectionsLoading,
    isDirectionsReady,
    directionError,
    tripDurationText,
    tripDistanceText,
    currentManeuver,
    currentInstructionText,
    currentStepDurationText,
    currentStepDistanceText,
    currentStepProgressText,
    navigationPolylineCoordinates,
    onMapReady,
    handleExitGuidance,
    navigationEndpoints,
  } = useMapNavigationGuidance({
    targetNavigationPointId,
    mapPoints,
    userLocation,
    permissionStatus,
    isTracking,
    startTracking,
    alert,
    clearTargetNavigationParam,
  });

  // Cleanup location tracking on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [isTracking, stopTracking]);

  useEffect(() => {
    if (!isFocused && isTracking) {
      stopTracking();
    }
  }, [isFocused, isTracking, stopTracking]);

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
        logger.info('Navigate to:', point);

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

  /**
   * Handle permission request from banner
   */
  const handleRequestPermission = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      // Start tracking after permission granted
      startTracking();
    }
  }, [requestPermission, startTracking]);

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

  if (!isFocused) {
    return null;
  }

  function onNavigationExit(): void {
    handleExitGuidance();
    mapRef.current?.reloadMap();
  }

  return (
    <ScreenLayout showBackButton={false}>
      {/* Permission banner - shows when permission needed or error */}
      <LocationPermissionBanner
        permissionStatus={permissionStatus}
        onRequestPermission={handleRequestPermission}
        error={locationError}
      />

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
        navigationPolylineCoordinates={isGuidanceMode ? navigationPolylineCoordinates : []}
        isGuidanceMode={isGuidanceMode}
        markerFilters={markerFilters}
      />

      {!isGuidanceMode ? (
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
        durationText={tripDurationText}
        distanceText={tripDistanceText}
        currentManeuver={currentManeuver}
        currentInstructionText={currentInstructionText}
        currentStepDurationText={currentStepDurationText}
        currentStepDistanceText={currentStepDistanceText}
        currentStepProgressText={currentStepProgressText}
        onExit={onNavigationExit}
      />

      {/* Point detail modal */}
      {!isGuidanceMode ? (
        <>
          <MapPointDetailModal
            point={selectedPoint}
            visible={modalVisible}
            onClose={handleCloseModal}
            onViewDetails={handleNavigate}
          />
          <CheckinCameraButton
            onOpenCamera={handleOpenCheckinCamera}
            isSugestingCheckin={activePoint != null}
          />
        </>
      ) : null}

      {/* {isMapBootstrapping ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 999,
          }}>
          <FullScreenLoader
            hideBack
            message={isMapPointsLoading ? 'Loading map points...' : 'Acquiring your location...'}
          />
        </View>
      ) : null} */}
    </ScreenLayout>
  );
}
