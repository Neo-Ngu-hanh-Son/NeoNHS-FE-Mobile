import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { logger } from '@/utils/logger';
import { MapPoint, MapPointCheckin } from '../types';
import MapPointDetailModal from '../components/PointDetailModal/PointDetailModal';
import NHSMap, { NHSMapRef } from '../components/Map/NHSMap';
import { mapService } from '../services/mapServices';
import { useModal } from '@/app/providers/ModalProvider';
import { useUserLocation } from '../hooks/useUserLocation';
import { LocationPermissionBanner } from '../components/UserLocation';
import { mapData } from '../data';
import { CompositeScreenProps } from '@react-navigation/native';
import { ScreenLayout } from '@/components/common/ScreenLayout';
import { useQuery } from '@tanstack/react-query';
import CheckinCameraButton from '../components/Camera/CheckinCameraButton';
import { useCheckinProximity } from '../hooks/useCheckinProximity';
import { parseFloatOrDefault } from '@/utils/parseNumber';
import { useAuth } from '@/features/auth/context/AuthContext';

type MapScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Map'>,
  StackScreenProps<MainStackParamList>
>;
export default function MapScreen({ navigation, route }: MapScreenProps) {
  const { isAuthenticated } = useAuth();
  const initialPointId = route.params?.pointId;
  const [showBackButton, setShowBackButton] = useState(!!initialPointId);
  const isSyncingNearbyCheckinsRef = useRef(false);

  // Sync showBackButton when navigating to this tab with a new pointId
  // (useState only captures the value on first mount, but this tab persists)
  useEffect(() => {
    if (initialPointId) {
      setShowBackButton(true);
    }
  }, [initialPointId]);

  // Map state
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef<NHSMapRef>(null);
  const [checkinPoints, setCheckinPoints] = useState<MapPointCheckin[]>([]);

  // Modal helpers
  const { alert } = useModal();

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
    calculateDistance,
    syncNearbyGeofences,
  } = useUserLocation({
    autoStart: true, // Auto-start location tracking when entering map screen
    updateInterval: 3000,
    distanceInterval: 5,
  });

  const { data: mapPoints = mapData.mapPoints, isError: isMapPointsError } = useQuery({
    queryKey: ['mapPoints'],
    queryFn: async () => {
      const res = await mapService.getMapPoints();
      return res.data as MapPoint[];
    },
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

  // Cleanup location tracking on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [isTracking, stopTracking]);

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

  // Checkin point detections - sync nearby geofences whenever location changes
  useEffect(() => {
    let isCancelled = false;

    const hasCheckinPointsChanged = (
      current: MapPointCheckin[],
      next: MapPointCheckin[]
    ): boolean => {
      if (current.length !== next.length) return true;

      for (let i = 0; i < current.length; i += 1) {
        if (current[i].id !== next[i].id) {
          return true;
        }
      }

      return false;
    };

    const checkinDetection = async () => {
      if (!userLocation || isSyncingNearbyCheckinsRef.current) {
        return;
      }

      // Only call backend when user moved at least 10m, or at first location update.
      const previousCoords = {
        latitude: previousLocation?.latitude ?? userLocation.latitude,
        longitude: previousLocation?.longitude ?? userLocation.longitude,
      };
      const distanceMoved = calculateDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: previousCoords.latitude, longitude: previousCoords.longitude }
      );

      if (distanceMoved <= 10 && previousLocation) {
        return;
      }

      isSyncingNearbyCheckinsRef.current = true;

      try {
        const nearbyCheckinPoints = await syncNearbyGeofences(
          userLocation.latitude,
          userLocation.longitude
        );

        if (!isCancelled) {
          setCheckinPoints((currentPoints) =>
            hasCheckinPointsChanged(currentPoints, nearbyCheckinPoints)
              ? nearbyCheckinPoints
              : currentPoints
          );
        }
      } catch (e) {
        logger.error('[MapScreen] Error occurred while syncing nearby checkins:', e);
      } finally {
        isSyncingNearbyCheckinsRef.current = false;
      }
    };

    checkinDetection();

    return () => {
      isCancelled = true;
    };
  }, [userLocation, previousLocation, calculateDistance, syncNearbyGeofences]);

  const activePoint = useCheckinProximity(userLocation, checkinPoints, 20);

  const handleOpenCheckinCamera = useCallback(() => {
    if (!isAuthenticated) {
      navigation.getParent()?.getParent()?.navigate('Auth', { screen: 'Login' });
      return;
    }

    navigation.navigate('CheckinCamera', {
      pointId: activePoint?.id,
    });
  }, [activePoint, isAuthenticated, navigation]);

  return (
    <ScreenLayout showBackButton={showBackButton}>
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
        isLocationLoading={isLocationLoading}
      />

      {/* Point detail modal */}
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
    </ScreenLayout>
  );
}
