import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { logger } from '@/utils/logger';
import { MapPoint } from '../types';
import PointDetailModal from '../components/PointDetailModal/PointDetailModal';
import NHSMap, { NHSMapRef } from '../components/Map/NHSMap';
import { getAllDestinations, getPointOfAttraction } from '../services/mapServices';
import { useModal } from '@/app/providers/ModalProvider';
import { useUserLocation } from '../hooks/useUserLocation';
import { LocationPermissionBanner } from '../components/UserLocation';
import { mapData } from '../data';
import { CompositeScreenProps } from '@react-navigation/native';
import { ScreenLayout } from '@/components/common/ScreenLayout';

type MapScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Map'>,
  StackScreenProps<MainStackParamList>
>;
export default function MapScreen({ navigation, route }: MapScreenProps) {
  const initialPointId = route.params?.pointId;
  const [showBackButton, setShowBackButton] = useState(!!initialPointId);

  // Sync showBackButton when navigating to this tab with a new pointId
  // (useState only captures the value on first mount, but this tab persists)
  useEffect(() => {
    if (initialPointId) {
      setShowBackButton(true);
    }
  }, [initialPointId]);

  console.log('showBackButton', showBackButton);
  console.log('point id', initialPointId);

  // Map state
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const mapRef = useRef<NHSMapRef>(null);

  // Modal helpers
  const { alert } = useModal();

  // User location tracking - auto-start on mount
  const {
    location: userLocation,
    isTracking,
    permissionStatus,
    error: locationError,
    isLoading: isLocationLoading,
    startTracking,
    stopTracking,
    requestPermission,
  } = useUserLocation({
    autoStart: true, // Auto-start location tracking when entering map screen
    updateInterval: 3000,
    distanceInterval: 5,
  });

  // Fetch ALL map points on mount
  useEffect(() => {
    async function fetchPoints() {
      try {
        const destinations = await getAllDestinations({ search: 'thuy son' });
        const res = await getPointOfAttraction(destinations.data[0].id);
        setMapPoints(res.data);
      } catch (error) {
        logger.error('[MapScreen] Failed to fetch map points, using default map points:', error);
        setMapPoints(mapData.mapPoints);
      }
    }
    fetchPoints();
  }, []);

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
            latitude: targetPoint.latitude,
            longitude: targetPoint.longitude,
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

  const handleNavigate = useCallback((point: MapPoint) => {
    if (point.id && point.id !== 'offline') {
      logger.info('Navigate to:', point);
      navigation.navigate('PointDetail', { pointId: point.id });
    } else {
      alert('Navigation Unavailable', 'Please connect to the internet to access this feature.');
    }
    setModalVisible(false);
  }, []);

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
      <PointDetailModal
        point={selectedPoint}
        visible={modalVisible}
        onClose={handleCloseModal}
        onViewDetails={handleNavigate}
      />
    </ScreenLayout>
  );
}
