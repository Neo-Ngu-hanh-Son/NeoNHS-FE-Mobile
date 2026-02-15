import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { logger } from '@/utils/logger';
import { MapPoint } from '../types';
import PointDetailModal from '../components/PointDetailModal/PointDetailModal';
import NHSMap, { NHSMapRef } from '../components/Map/NHSMap';
import getPointOfAttraction from '../services/mapServices';
import { NHS_ATTRACTION_ID } from '@/services/api/endpoints/map.api';
import { useModal } from '@/app/providers/ModalProvider';
import { useUserLocation } from '../hooks/useUserLocation';
import { LocationPermissionBanner } from '../components/UserLocation';
import { mapData } from '../data';

type MapScreenProps = StackScreenProps<TabsStackParamList, 'Map'>;

export default function MapScreen({ navigation }: MapScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  // Map state
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>(mapData.mapPoints);
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

  // Fetch map points on mount
  useEffect(() => {
    async function fetchPoints() {
      try {
        const res = await getPointOfAttraction(NHS_ATTRACTION_ID);
        setMapPoints(res.data);
      } catch (error) {
        logger.error('[MapScreen] Failed to fetch map points, using default map points:', error);
      }
    }
    fetchPoints();
  }, []);

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
    // TODO: Implement navigation to the point
    logger.info('Navigate to:', point.name);
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
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
        onNavigate={handleNavigate}
        onViewDetails={() => {
          logger.info('Not implemented yet');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
