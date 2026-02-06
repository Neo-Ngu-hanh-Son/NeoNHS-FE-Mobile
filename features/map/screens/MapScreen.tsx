import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import MapView from 'react-native-map-clustering';
import CustomMarker, { MapPoint } from '../components/Marker/CustomMarker';
import { ALL_ROUTES, MAP_POINTS, MAP_CENTER } from '../data/mapRoutes';
import { logger } from '@/utils/logger';
import PointDetailModal from '../components/PointDetailModal/PointDetailModal';
import MarkerVisual from '../components/Marker/MarkerVisual';

type MapScreenProps = StackScreenProps<TabsStackParamList, 'Map'>;

export default function MapScreen({ navigation }: MapScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleMarkerPress = useCallback((point: MapPoint) => {
    setSelectedPoint(point);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleNavigate = useCallback((point: MapPoint) => {
    // TODO: Implement navigation to the point
    logger.info('Navigate to:', point.title);
    setModalVisible(false);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View className="w-full flex-1" style={{ borderColor: theme.border, borderWidth: 1 }}>
        <MapView
          style={{ flex: 1 }}
          provider={PROVIDER_GOOGLE}
          initialRegion={MAP_CENTER}
          clusterColor={theme.primary}
          radius={10}
          mapType="hybrid">
          {ALL_ROUTES.map((route) => (
            <Polyline
              key={route.id}
              coordinates={route.coordinates}
              strokeColor={route.color}
              strokeWidth={4}
              lineDashPattern={[0]}
            />
          ))}

          {/* Note: The <Marker> component must be here, if no, clustering will not work*/}
          {Array.from({ length: 40 }).map((_, i) => (
            <Marker
              key={i}
              coordinate={{
                latitude: 16.002819 + Math.random() * 0.005,
                longitude: 108.26247 + Math.random() * 0.005,
              }}
              title={`Random Point ${i + 1}`}
              description="This is a randomly generated point for clustering demo."
            />
          ))}

          {MAP_POINTS.map((point) => (
            <Marker
              coordinate={{
                latitude: point.latitude,
                longitude: point.longitude,
              }}
              key={point.id}
              onPress={() => handleMarkerPress(point)}
              title={point.title}
              description={point.description}>
              <MarkerVisual point={point} />
            </Marker>
          ))}
        </MapView>
      </View>

      {/* Point Detail Bottom Modal */}
      <PointDetailModal
        point={selectedPoint}
        visible={modalVisible}
        onClose={handleCloseModal}
        onNavigate={handleNavigate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 16,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
