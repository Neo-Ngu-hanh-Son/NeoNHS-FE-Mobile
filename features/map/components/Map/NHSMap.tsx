import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useEffect,
} from 'react';
import { MapPoint } from '../..';
import { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MAP_CENTER } from '../../data';
import MapView from 'react-native-map-clustering';
import { renderRoutes } from '../../data/mapDataOptimized';
import MarkerVisual from '../Marker/MarkerVisual';
import { logger } from '@/utils/logger';
import { View, StyleSheet } from 'react-native';
import { UserLocation } from '../../hooks/useUserLocation';
import { UserLocationMarker, CenterOnUserButton } from '../UserLocation';

/**
 * Props for NHSMap component
 */
type NHSMapProps = {
  /** Callback when a marker is pressed */
  onMarkerPress?: (point: MapPoint) => void;
  /** ID of currently selected point */
  selectedPointId?: string | null;
  /** Callback when map background is pressed */
  onMapPress?: () => void;
  /** Array of map points to display as markers */
  mapPoints?: MapPoint[];
  /** User's current location (optional) */
  userLocation?: UserLocation | null;
  /** Whether user location tracking is active */
  isTrackingLocation?: boolean;
  /** Whether location is loading */
  isLocationLoading?: boolean;
  /** Callback to center on user location */
  onCenterOnUser?: () => void;
};

/**
 * Methods exposed via ref
 */
export interface NHSMapRef {
  /** Animate map to specific region */
  animateToRegion: (region: Region, duration?: number) => void;
  /** Animate map to specific coordinate */
  animateToCoordinate: (
    coordinate: { latitude: number; longitude: number },
    duration?: number
  ) => void;
}

/**
 * Main map component for NHS attraction
 * Features:
 * - Clustered markers for POIs
 * - Polyline routes
 * - User location display
 * - Center on user button
 */
const NHSMap = forwardRef<NHSMapRef, NHSMapProps>(
  (
    {
      onMarkerPress,
      mapPoints,
      userLocation,
      isTrackingLocation = false,
      isLocationLoading = false,
      onCenterOnUser,
    },
    ref
  ) => {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [shouldDisplayMarkerName, setShouldDisplayMarkerName] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [autoPanToUser, setAutoPanToUser] = useState(false);
    const mapRef = useRef<any>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        mapRef.current?.animateToRegion(region, duration);
      },
      animateToCoordinate: (
        coordinate: { latitude: number; longitude: number },
        duration = 500
      ) => {
        mapRef.current?.animateToRegion(
          {
            ...coordinate,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          },
          duration
        );
      },
    }));

    const handleAutoToggleMarkerNames = useCallback(
      (region: Region) => {
        const zoom = Math.log2(360 / region.longitudeDelta);
        const shouldShow = zoom >= 17.5;
        setShouldDisplayMarkerName((prev) => (prev === shouldShow ? prev : shouldShow));
      },
      [autoPanToUser, setShouldDisplayMarkerName, setAutoPanToUser]
    );

    const handleOnMapPress = () => {
      // When user finish drag the map, don't auto pan to user anymore
      if (autoPanToUser) {
        logger.info('User moved the map, disabling auto pan to user');
        setAutoPanToUser(false);
      }
    };

    const handleCenterOnUser = useCallback(() => {
      if (userLocation && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          },
          500
        );
      }
      onCenterOnUser?.();
      setAutoPanToUser(true);
    }, [userLocation, onCenterOnUser]);

    // Effect to auto pan to user location if enabled
    useEffect(() => {
      logger.info('Auto pan to user effect triggered', {
        isMapReady,
        autoPanToUser,
        userLocation: userLocation !== null ? 'userLocation available' : 'no userLocation',
      });
      if (isMapReady && autoPanToUser && userLocation && mapRef.current) {
        logger.info('Auto panning to user location');
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          },
          500
        );
      }
    }, [isMapReady, autoPanToUser, userLocation]);

    return (
      <View style={[styles.container, { borderColor: theme.border, borderWidth: 1 }]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={MAP_CENTER}
          clusterColor={theme.primary}
          radius={10}
          mapType="satellite"
          showsUserLocation={false} // We use custom marker
          showsMyLocationButton={false} // We use custom button
          onRegionChangeComplete={handleAutoToggleMarkerNames}
          onMapReady={() => {
            setIsMapReady(true);
          }}
          onPress={handleOnMapPress}
          customMapStyle={[]}>
          {/* Render polylines path (static for now) */}
          {renderRoutes.map((line) => (
            <Polyline
              key={line.id}
              coordinates={line.coordinates}
              strokeColor="#fafafa50"
              strokeWidth={8}
            />
          ))}

          {/* Render POI markers */}
          {mapPoints?.map((poi) => (
            <Marker
              key={poi.id}
              coordinate={{
                latitude: poi.latitude,
                longitude: poi.longitude,
              }}
              onPress={() => {
                onMarkerPress?.(poi);
              }}>
              <MarkerVisual point={poi} showName={shouldDisplayMarkerName} />
            </Marker>
          ))}

          {/* Render user location marker */}
          {userLocation && (
            <UserLocationMarker
              location={userLocation}
              showAccuracyCircle={true}
              showHeading={true}
            />
          )}
        </MapView>

        {/* Center on user button */}
        <View style={[styles.centerButtonContainer, { backgroundColor: theme.background }]}>
          <CenterOnUserButton
            onPress={handleCenterOnUser}
            isLoading={isLocationLoading}
            hasLocation={!!userLocation}
            isTracking={isTrackingLocation}
          />
        </View>
      </View>
    );
  }
);

NHSMap.displayName = 'NHSMap';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  centerButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    padding: 6,
    borderRadius: 12,
    elevation: 4,
  },
});

export default NHSMap;
