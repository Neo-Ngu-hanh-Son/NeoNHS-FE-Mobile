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

type NHSMapProps = {
  onMarkerPress?: (point: MapPoint) => void;
  selectedPointId?: string | null;
  onMapPress?: () => void;
  mapPoints?: MapPoint[];
  userLocation?: UserLocation | null;
  isLocationLoading?: boolean;
};

export interface NHSMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
  animateToCoordinate: (
    coordinate: { latitude: number; longitude: number },
    duration?: number
  ) => void;
  setFollowUser: (follow: boolean) => void;
  isFollowingUser: () => boolean;
}

const NHSMap = forwardRef<NHSMapRef, NHSMapProps>(
  ({ onMarkerPress, mapPoints, userLocation, isLocationLoading = false, selectedPointId }, ref) => {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [shouldDisplayMarkerName, setShouldDisplayMarkerName] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const mapZoomRef = useRef({
      latitudeDelta: MAP_CENTER.latitudeDelta,
      longitudeDelta: MAP_CENTER.longitudeDelta,
    });
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
            latitudeDelta: mapZoomRef.current.latitudeDelta,
            longitudeDelta: mapZoomRef.current.longitudeDelta,
          },
          duration
        );
      },
      setFollowUser: (follow: boolean) => {
        setIsFollowingUser(follow);
      },
      isFollowingUser: () => isFollowingUser,
    }));

    const handleRegionChangeComplete = useCallback((region: Region) => {
      const zoom = Math.log2(360 / region.longitudeDelta);
      const shouldShow = zoom >= 17.5;
      setShouldDisplayMarkerName((prev) => (prev === shouldShow ? prev : shouldShow));
      mapZoomRef.current.latitudeDelta = region.latitudeDelta;
      mapZoomRef.current.longitudeDelta = region.longitudeDelta;
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
            latitudeDelta: mapZoomRef.current.latitudeDelta,
            longitudeDelta: mapZoomRef.current.longitudeDelta,
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
            latitudeDelta: mapZoomRef.current.latitudeDelta,
            longitudeDelta: mapZoomRef.current.longitudeDelta,
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
          {renderRoutes.map((line) => (
            <Polyline
              key={line.id}
              coordinates={line.coordinates}
              strokeColor="#fafafa50"
              strokeWidth={8}
            />
          ))}

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
              <MarkerVisual
                point={poi}
                showName={shouldDisplayMarkerName}
                isSelected={selectedPointId === poi.id}
              />
            </Marker>
          ))}

          {userLocation && (
            <UserLocationMarker
              location={userLocation}
              showAccuracyCircle={true}
              showHeading={true}
            />
          )}
        </MapView>

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
