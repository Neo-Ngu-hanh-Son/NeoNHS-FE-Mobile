import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import React, {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
  useEffect,
  useMemo,
} from 'react';
import { MapPoint } from '../..';
import { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MAP_CENTER } from '../../data';
// import MapView from 'react-native-map-clustering';
import MapView from 'react-native-maps';
import { renderRoutes } from '../../data/mapDataOptimized';
import MarkerVisual from '../Marker/MarkerVisual';
import { logger } from '@/utils/logger';
import { View, StyleSheet } from 'react-native';
import { UserLocation } from '../../hooks/useUserLocation';
import { UserLocationMarker, FollowUserButton } from '../UserLocation';
import { useFocusEffect } from '@react-navigation/native';
import { parseFloatOrDefault } from '@/utils/parseNumber';

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
    coordinate: { latitude: number; longitude: number; latDelta?: number; lngDelta?: number },
    duration?: number
  ) => void;
  setFollowUser: (follow: boolean) => void;
  isFollowingUser: () => boolean;
  setZoom: (zoom: number) => void;
}

const NHSMap = forwardRef<NHSMapRef, NHSMapProps>(
  ({ onMarkerPress, mapPoints, userLocation, isLocationLoading = false, selectedPointId }, ref) => {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [shouldDisplayMarkerName, setShouldDisplayMarkerName] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [mapKey, setMapKey] = useState(0);

    const mapZoomRef = useRef({
      latitudeDelta: MAP_CENTER.latitudeDelta,
      longitudeDelta: MAP_CENTER.longitudeDelta,
    });
    const mapRef = useRef<MapView>(null);
    const currentRegionRef = useRef<Region>(MAP_CENTER);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      animateToRegion: (region: Region, duration = 500) => {
        mapRef.current?.animateToRegion(region, duration);
      },
      animateToCoordinate: (
        coordinate: { latitude: number; longitude: number; latDelta?: number; lngDelta?: number },
        duration = 500
      ) => {
        mapRef.current?.animateToRegion(
          {
            ...coordinate,
            latitudeDelta: coordinate.latDelta ?? mapZoomRef.current.latitudeDelta,
            longitudeDelta: coordinate.lngDelta ?? mapZoomRef.current.longitudeDelta,
          },
          duration
        );
      },
      setFollowUser: (follow: boolean) => {
        setIsFollowingUser(follow);
      },
      isFollowingUser: () => isFollowingUser,
      setZoom: (delta: number) => {
        const current = currentRegionRef.current;

        mapRef.current?.animateToRegion(
          {
            latitude: current.latitude,
            longitude: current.longitude,
            latitudeDelta: delta,
            longitudeDelta: delta,
          },
          500
        );
      },
    }));

    const handleRegionChangeComplete = useCallback((region: Region) => {
      const zoom = Math.log2(360 / region.longitudeDelta);
      const shouldShow = zoom >= 17.5;
      setShouldDisplayMarkerName((prev) => (prev === shouldShow ? prev : shouldShow));

      // Store for later
      currentRegionRef.current = region;
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

    // 1. Memoize the routes (since they never change)
    const memoizedRoutes = useMemo(() => {
      return renderRoutes.map((line) => (
        <Polyline
          key={line.id}
          coordinates={line.coordinates}
          strokeColor="#fafafa50"
          strokeWidth={8}
        />
      ));
    }, []); // Empty array because renderRoutes is static imported data

    // 2. Memoize the map points
    const memoizedMarkers = useMemo(() => {
      if (!isMapReady || !mapPoints) return null;

      const parentMarkers = mapPoints
        .filter(
          (poi) =>
            parseFloatOrDefault(poi.latitude, -1) !== -1 &&
            parseFloatOrDefault(poi.longitude, -1) !== -1
        )
        .map((poi) => (
          <Marker
            key={poi.id}
            coordinate={{
              latitude: parseFloatOrDefault(poi.latitude, 0),
              longitude: parseFloatOrDefault(poi.longitude, 0),
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
        ));

      const checkinMarkers = mapPoints.flatMap((parentPoint) =>
        (parentPoint.checkinPoints ?? [])
          .filter(
            (checkin) =>
              checkin.isActive !== false &&
              parseFloatOrDefault(checkin.latitude, -1) !== -1 &&
              parseFloatOrDefault(checkin.longitude, -1) !== -1
          )
          .map((checkin) => {
            const isUserCheckedIn = checkin.isUserCheckedIn ?? false;
            logger.debug(`Checkin point ${checkin.name} isUserCheckedIn: ${isUserCheckedIn}`);
            let pointType = checkin.type ?? 'CHECKIN';
            if (isUserCheckedIn) {
              pointType = 'USER_CHECKIN';
            }

            const checkinAsPoint: MapPoint = {
              id: checkin.id,
              name: checkin.name,
              description: checkin.description,
              thumbnailUrl: checkin.thumbnailUrl,
              latitude: checkin.latitude,
              longitude: checkin.longitude,
              type: pointType,
              attractionId: parentPoint.id,
              panoramaImageUrl: checkin.panoramaImageUrl,
              defaultYaw: checkin.defaultYaw,
              defaultPitch: checkin.defaultPitch,
            };

            return (
              <Marker
                key={`checkin-${checkin.id}`}
                coordinate={{
                  latitude: parseFloatOrDefault(checkin.latitude, 0),
                  longitude: parseFloatOrDefault(checkin.longitude, 0),
                }}
                zIndex={30}
                onPress={() => {
                  onMarkerPress?.(checkinAsPoint);
                }}>
                <MarkerVisual
                  point={checkinAsPoint}
                  showName={shouldDisplayMarkerName}
                  isSelected={selectedPointId === checkin.id}
                />
              </Marker>
            );
          })
      );

      return [...parentMarkers, ...checkinMarkers];
    }, [isMapReady, mapPoints, shouldDisplayMarkerName, selectedPointId, onMarkerPress]);

    return (
      <View style={[styles.container, { borderColor: theme.border, borderWidth: 1 }]}>
        <MapView
          key={mapKey}
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={MAP_CENTER}
          // clusterColor={theme.primary}
          // radius={10}
          mapType="standard"
          showsUserLocation={false} // We use custom marker
          showsMyLocationButton={false} // We use custom button
          onRegionChangeComplete={handleRegionChangeComplete}
          onMapReady={() => {
            setIsMapReady(true);
          }}
          onPanDrag={handleMapInteraction} // Detect when user drags the map
          customMapStyle={[]}>
          {/* Markers */}
          {memoizedRoutes}
          {memoizedMarkers}

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
    zIndex: 10,
  },
});

export default React.memo(NHSMap);
