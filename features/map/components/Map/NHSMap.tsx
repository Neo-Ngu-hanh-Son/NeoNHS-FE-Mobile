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
import { UserLocationMarker, FollowUserButton } from '../UserLocation';

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
  /** Whether location is loading */
  isLocationLoading?: boolean;
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
  /** Set follow user mode */
  setFollowUser: (follow: boolean) => void;
  /** Get current follow user state */
  isFollowingUser: () => boolean;
}

/**
 * Main map component for NHS attraction
 * Features:
 * - Clustered markers for POIs
 * - Polyline routes
 * - User location display
 * - Follow user toggle button
 */
const NHSMap = forwardRef<NHSMapRef, NHSMapProps>(
  ({ onMarkerPress, mapPoints, userLocation, isLocationLoading = false, selectedPointId }, ref) => {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [shouldDisplayMarkerName, setShouldDisplayMarkerName] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
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
      setFollowUser: (follow: boolean) => {
        setIsFollowingUser(follow);
      },
      isFollowingUser: () => isFollowingUser,
    }));

    /**
     * Handle region change - toggle marker names based on zoom level
     */
    const handleRegionChangeComplete = useCallback((region: Region) => {
      const zoom = Math.log2(360 / region.longitudeDelta);
      const shouldShow = zoom >= 17.5;
      setShouldDisplayMarkerName((prev) => (prev === shouldShow ? prev : shouldShow));
    }, []);

    /**
     * Handle map press/drag - disable follow mode when user interacts with map
     */
    const handleMapInteraction = useCallback(() => {
      if (isFollowingUser) {
        logger.info('User interacted with map, disabling follow mode');
        setIsFollowingUser(false);
      }
    }, [isFollowingUser]);

    /**
     * Handle follow user button press - toggle follow mode
     */
    const handleFollowUserToggle = useCallback(() => {
      const newFollowState = !isFollowingUser;
      setIsFollowingUser(newFollowState);

      // If enabling follow mode, immediately pan to user location
      if (newFollowState && userLocation && mapRef.current) {
        logger.info('Follow mode enabled, panning to user location');
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          },
          500
        );
      } else {
        logger.info('Follow mode disabled');
      }
    }, [isFollowingUser, userLocation]);

    /**
     * Effect to auto-pan to user location when following
     * Triggers whenever user location updates while in follow mode
     */
    useEffect(() => {
      if (isMapReady && isFollowingUser && userLocation && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          },
          300 // Smooth animation
        );
      }
    }, [isMapReady, isFollowingUser, userLocation]);

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
          onRegionChangeComplete={handleRegionChangeComplete}
          onMapReady={() => {
            setIsMapReady(true);
          }}
          onPanDrag={handleMapInteraction} // Detect when user drags the map
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
              tracksViewChanges={selectedPointId === poi.id}
              onPress={() => {
                onMarkerPress?.(poi);
              }}>
              <MarkerVisual
                point={poi}
                showName={shouldDisplayMarkerName}
                isSelected={selectedPointId === poi.id}
              />
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

        {/* Follow user button */}
        <View style={[styles.followButtonContainer, { backgroundColor: theme.background }]}>
          <FollowUserButton
            onPress={handleFollowUserToggle}
            isLoading={isLocationLoading}
            hasLocation={!!userLocation}
            isFollowing={isFollowingUser}
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
  followButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    padding: 6,
    borderRadius: 12,
    elevation: 4,
  },
});

export default NHSMap;
