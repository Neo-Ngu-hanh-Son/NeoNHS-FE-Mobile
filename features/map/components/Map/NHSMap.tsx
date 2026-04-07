import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import React, { useCallback, useImperativeHandle, useRef, useState, forwardRef, useEffect, useMemo } from 'react';
import { MapPoint } from '../..';
import MapView, { Camera, Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MAP_CENTER } from '../../data';
// import MapView from 'react-native-map-clustering';
import { renderRoutes } from '../../data/mapDataOptimized';
import MarkerVisual from '../Marker/MarkerVisual';
import { logger } from '@/utils/logger';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { UserLocation } from '../../hooks/useUserLocation';
import { UserLocationMarker, FollowUserButton } from '../UserLocation';
import { MapPointCheckin, PolylineCoordinate } from '../../types';
import { hasCheckinPointsChanged } from '../../helpers';
import { useCheckinProximity } from '../../hooks/useCheckinProximity';
import type { MapMarkerFilters } from '../../hooks';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { distanceUtils } from '@/utils/distanceUtils';
import MAP_CONSTANTS from '../../constants';
import { useMapStore } from '../../store/useMapStore';

type NHSMapProps = {
  onMarkerPress?: (point: MapPoint) => void;
  selectedPointId?: string | null;
  onMapPress?: () => void;
  mapPoints?: MapPoint[];
  userLocation?: UserLocation | null;
  previousLocation?: UserLocation | null;
  syncNearbyGeofences?: (latitude: number, longitude: number) => Promise<MapPointCheckin[]>;
  onActiveCheckinPointChange?: (point: MapPointCheckin | null) => void;
  isLocationLoading?: boolean;
  startTrackingCallback?: () => void;
  onMapReadyCallback?: () => void;
  navigationPolylineCoordinates: PolylineCoordinate[];
  isNavPolylineVisible?: boolean;
  isGuidanceMode?: boolean;
  isMapInteractionEnabled?: boolean;
  markerFilters?: MapMarkerFilters;
};

export interface NHSMapRef {
  animateToRegion: (region: Region, duration?: number) => void;
  animateToCoordinate: (
    coordinate: { latitude: number; longitude: number; latDelta?: number; lngDelta?: number },
    duration?: number
  ) => void;
  fitToCoordinates: (
    coordinates: { latitude: number; longitude: number }[],
    edgePadding?: { top: number; right: number; bottom: number; left: number },
    animated?: boolean
  ) => void;
  setFollowUser: (follow: boolean) => void;
  isFollowingUser: () => boolean;
  setZoom: (zoom: number) => void;
  reloadMap: () => void;
}

const NHSMap = forwardRef<NHSMapRef, NHSMapProps>(
  (
    {
      onMarkerPress,
      mapPoints,
      userLocation,
      previousLocation,
      syncNearbyGeofences,
      onActiveCheckinPointChange,
      isLocationLoading = false,
      selectedPointId,
      startTrackingCallback,
      onMapReadyCallback,
      navigationPolylineCoordinates,
      isNavPolylineVisible,
      isGuidanceMode = false,
      isMapInteractionEnabled = true,
      markerFilters,
    },
    ref
  ) => {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const [shouldDisplayMarkerName, setShouldDisplayMarkerName] = useState(false);
    // const [isMapReady, setIsMapReady] = useState(false);
    const [isFollowingUser, setIsFollowingUser] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    const [checkinPoints, setCheckinPoints] = useState<MapPointCheckin[]>([]);

    const isSyncingNearbyCheckinsRef = useRef(false);
    const mapZoomRef = useRef({
      latitudeDelta: MAP_CENTER.latitudeDelta,
      longitudeDelta: MAP_CENTER.longitudeDelta,
    });
    const setMapZoom = useMapStore((state) => state.setMapZoom);
    // This is so that the map can retain the last user-interacted location
    const [lastMapInteractionLocation, setLastMapInteractionLocation] = useState<Region | undefined>(MAP_CENTER);
    const mapRef = useRef<MapView>(null);
    const currentRegionRef = useRef<Region>(MAP_CENTER);
    const onMarkerPressRef = useRef(onMarkerPress); // Store in ref to avoid re-creating handlers and causing re-renders
    const isFocused = useIsFocused();

    // Zustand store for global map state
    const viewMode = useMapStore((state) => state.viewMode);
    const setIsMapReady = useMapStore((state) => state.setIsMapReady);
    const isMapReady = useMapStore((state) => state.isMapReady);
    // const setGlobalLastMapInteractionLocation = useMapStore((state) => state.setLastMapInteractionLocation);
    // const setGlobalMapZoom = useMapStore((state) => state.setMapZoom);

    const activeCheckinPoint = useCheckinProximity(
      userLocation,
      checkinPoints,
      MAP_CONSTANTS.CHECKINPOINT_DETECT_RADIUS_M,
      isGuidanceMode
    );

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
      fitToCoordinates: (
        coordinates: { latitude: number; longitude: number }[],
        edgePadding = { top: 120, right: 64, bottom: 160, left: 64 },
        animated = true
      ) => {
        if (coordinates.length < 2) {
          return;
        }

        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding,
          animated,
        });
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
      reloadMap: () => {
        handleReloadMap();
      },
    }));

    useEffect(() => {
      if (!isFocused) return;

      logger.info('[NHSMap] Map reload triggered by focus change');
      setMapKey((prev) => prev + 1);
    }, [isFocused]);

    const handleRegionChangeComplete = useCallback((region: Region) => {
      const zoom = Math.log2(360 / region.longitudeDelta);
      const shouldShow = zoom >= 17.5;
      setShouldDisplayMarkerName((prev) => (prev === shouldShow ? prev : shouldShow));
      // Store for later
      currentRegionRef.current = region;
      mapZoomRef.current.latitudeDelta = region.latitudeDelta;
      mapZoomRef.current.longitudeDelta = region.longitudeDelta;

      setLastMapInteractionLocation(region);
    }, []);

    const handleMapInteraction = useCallback(() => {
      if (isFollowingUser) {
        setIsFollowingUser(false);
      }
    }, [isFollowingUser]);

    const handleFollowUserToggle = useCallback(() => {
      const newFollowState = !isFollowingUser;
      startTrackingCallback?.();
      setIsFollowingUser(newFollowState);

      // If enabling follow mode, immediately pan to user location
      if (newFollowState && userLocation && mapRef.current) {
        mapRef.current.getCamera().then((currentCamera: Camera) => {
          mapRef.current?.animateCamera(
            {
              center: {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              },
              heading: currentCamera.heading,
              zoom: currentCamera.zoom,
              pitch: currentCamera.pitch,
            },
            { duration: 300 }
          );
        });
        setMapZoom({
          latitudeDelta: mapZoomRef.current.latitudeDelta,
          longitudeDelta: mapZoomRef.current.longitudeDelta,
        });
      } else {
        logger.info('Follow mode disabled');
      }
    }, [isFollowingUser, userLocation, startTrackingCallback, setMapZoom]);

    const handleReloadMap = useCallback(() => {
      logger.info('[NHSMap] Map reload triggered');
      setIsMapReady(false);
      setIsFollowingUser(false);
      setMapKey((prev) => prev + 1);
    }, [setIsMapReady]);

    useEffect(() => {
      onActiveCheckinPointChange?.(activeCheckinPoint);
    }, [activeCheckinPoint, onActiveCheckinPointChange]);

    /**
     * useEffect to fetch checkin points near user when the user moves.
     */
    useEffect(() => {
      if (isGuidanceMode) return;
      let isCancelled = false;

      const syncCheckinPoints = async () => {
        if (!userLocation || !syncNearbyGeofences) {
          return;
        }
        if (isSyncingNearbyCheckinsRef.current) {
          return;
        }

        const previousCoords = {
          latitude: previousLocation?.latitude ?? userLocation.latitude,
          longitude: previousLocation?.longitude ?? userLocation.longitude,
        };
        const distanceMoved = distanceUtils.calculateDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: previousCoords.latitude, longitude: previousCoords.longitude }
        );

        if (distanceMoved <= MAP_CONSTANTS.DISTANCE_LIMIT_BEFORE_REFETCH_M && previousLocation) {
          return;
        }

        isSyncingNearbyCheckinsRef.current = true;

        try {
          const nearbyCheckinPoints = await syncNearbyGeofences(userLocation.latitude, userLocation.longitude);

          if (!isCancelled) {
            setCheckinPoints((currentPoints) =>
              hasCheckinPointsChanged(currentPoints, nearbyCheckinPoints) ? nearbyCheckinPoints : currentPoints
            );
          }
        } catch (error) {
          logger.error('[NHSMap] Error occurred while syncing nearby checkins:', error);
        } finally {
          isSyncingNearbyCheckinsRef.current = false;
        }
      };

      syncCheckinPoints();

      return () => {
        isCancelled = true;
      };
    }, [userLocation, previousLocation, syncNearbyGeofences, isGuidanceMode]);

    /**
     * Effect to auto-pan to user location when following
     * Triggers whenever user location updates while in follow mode
     */
    useEffect(() => {
      if (!isFocused) return;
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
    }, [isMapReady, isFollowingUser, userLocation, isFocused]);

    // 1. Memoize the routes of Thuy Son mountain
    const memoizedRoutes = useMemo((): React.ReactNode[] => {
      return renderRoutes.map((line) => (
        <Polyline key={line.id} coordinates={line.coordinates} strokeColor="#fafafa50" strokeWidth={8} />
      ));
    }, []);

    // 2. Memoize the navigation route
    const memoizedNavigationRoute = useMemo(() => {
      // const hasPoints = navigationPolylineCoordinates && navigationPolylineCoordinates.length >= 2;
      // Instead of returing null, modify the polyline to be transparent when not visible
      return (
        <Polyline
          coordinates={navigationPolylineCoordinates}
          strokeColor={isNavPolylineVisible ? theme.primary : `${theme.primary}00`}
          strokeWidth={isNavPolylineVisible ? 6 : 0}
          lineCap="round"
          lineJoin="round"
          zIndex={40}
        />
      );
    }, [isNavPolylineVisible, navigationPolylineCoordinates, theme.primary]);

    const effectiveMarkerFilters = useMemo<MapMarkerFilters>(() => {
      return (
        markerFilters ?? {
          showAll: true,
          showCheckin: false,
          showWorkshop: false,
          showEvent: false,
          showPlaces: false,
        }
      );
    }, [markerFilters]);

    const shouldShowParentPoint = useCallback(
      (point: MapPoint) => {
        if (effectiveMarkerFilters.showAll) {
          return true;
        }

        const isWorkshop = point.type === 'WORKSHOP';
        const isEvent = point.type === 'EVENT';
        const isCheckin = point.type === 'CHECKIN' || point.type === 'USER_CHECKIN';
        const isPlace = !isWorkshop && !isEvent && !isCheckin;

        return (
          (effectiveMarkerFilters.showWorkshop && isWorkshop) ||
          (effectiveMarkerFilters.showEvent && isEvent) ||
          (effectiveMarkerFilters.showCheckin && isCheckin) ||
          (effectiveMarkerFilters.showPlaces && isPlace)
        );
      },
      [effectiveMarkerFilters]
    );

    // 2. Memoize the map points
    const memoizedMarkers = useMemo(() => {
      if (!isMapReady || !mapPoints) return null;

      const parentMarkers = mapPoints
        .filter((poi) => poi.latitude !== -1 && poi.longitude !== -1 && shouldShowParentPoint(poi))
        .map((poi) => (
          <Marker
            key={poi.id}
            tracksViewChanges={true}
            coordinate={{
              latitude: poi.latitude,
              longitude: poi.longitude,
            }}
            onPress={() => {
              if (isGuidanceMode) {
                return;
              }
              onMarkerPressRef.current?.(poi);
            }}>
            <MarkerVisual
              point={poi}
              showName={shouldDisplayMarkerName}
              // isSelected={selectedPointId === poi.id}
            />
          </Marker>
        ));

      const canShowCheckinMarkers = effectiveMarkerFilters.showAll || effectiveMarkerFilters.showCheckin;

      const checkinMarkers = canShowCheckinMarkers
        ? mapPoints.flatMap((parentPoint) =>
            (parentPoint.checkinPoints ?? [])
              .filter((checkin) => checkin.isActive !== false && checkin.latitude !== -1 && checkin.longitude !== -1)
              .map((checkin) => {
                const isUserCheckedIn = checkin.isUserCheckedIn ?? false;
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
                    tracksViewChanges={true}
                    key={`checkin-${checkin.id}`}
                    coordinate={{
                      latitude: checkin.latitude,
                      longitude: checkin.longitude,
                    }}
                    zIndex={30}
                    onPress={() => {
                      if (isGuidanceMode) {
                        return;
                      }
                      // Sneak the id as parent point id so that the view detals work
                      let newCheckinAsPoint: MapPoint = { ...checkinAsPoint, id: parentPoint.id };
                      onMarkerPressRef.current?.(newCheckinAsPoint);
                    }}>
                    <MarkerVisual
                      point={checkinAsPoint}
                      showName={shouldDisplayMarkerName}
                      // isSelected={selectedPointId === checkin.id} (Because performance issues, this is removed)
                    />
                  </Marker>
                );
              })
          )
        : [];

      return [...parentMarkers, ...checkinMarkers];
    }, [
      isMapReady,
      mapPoints,
      shouldDisplayMarkerName,
      shouldShowParentPoint,
      effectiveMarkerFilters.showAll,
      effectiveMarkerFilters.showCheckin,
      isGuidanceMode,
    ]);

    return (
      <View style={[styles.container, { borderColor: theme.border, borderWidth: 1 }]}>
        <MapView
          key={mapKey}
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={lastMapInteractionLocation}
          // clusterColor={theme.primary}
          // radius={10}
          mapType="standard"
          scrollEnabled={isMapInteractionEnabled}
          zoomEnabled={isMapInteractionEnabled}
          rotateEnabled={isMapInteractionEnabled}
          pitchEnabled={isMapInteractionEnabled}
          showsUserLocation={false}
          showsMyLocationButton={false} // We use custom button
          onRegionChangeComplete={handleRegionChangeComplete}
          onMapReady={() => {
            setIsMapReady(true);
            onMapReadyCallback?.();
          }}
          onPanDrag={isMapInteractionEnabled ? handleMapInteraction : undefined} // Detect when user drags the map
          customMapStyle={MAP_CONSTANTS.GOOGLE_MAP_STYLE}>
          {/* Polylines */}
          {memoizedRoutes}
          {memoizedNavigationRoute}

          {/* Markers */}
          {memoizedMarkers}

          {userLocation && (
            <UserLocationMarker
              key={userLocation?.timestamp}
              location={userLocation}
              showAccuracyCircle={true}
              showHeading={true}
            />
          )}
        </MapView>

        <View style={[styles.buttonContainer, viewMode === 'NAVIGATING' ? { bottom: 80 } : { bottom: 24 }]}>
          <View style={[styles.followButtonContainer, { backgroundColor: theme.background }]}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Reload map"
              activeOpacity={0.8}
              onPress={handleReloadMap}
              style={[styles.reloadButton]}>
              <Ionicons name="reload" size={20} color={theme.foreground} />
            </TouchableOpacity>
          </View>

          <View style={[styles.followButtonContainer, { backgroundColor: theme.background }]}>
            <FollowUserButton
              onPress={handleFollowUserToggle}
              isLoading={isLocationLoading}
              hasLocation={!!userLocation}
              isFollowing={isFollowingUser}
            />
          </View>
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
  buttonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    gap: 8,
  },
  followButtonContainer: {
    borderRadius: 12,
    elevation: 4,
    zIndex: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  reloadButtonContainer: {
    borderRadius: 20,
    elevation: 4,
    zIndex: 20,
  },
  reloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(NHSMap);
