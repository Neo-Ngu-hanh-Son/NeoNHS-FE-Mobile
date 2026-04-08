import type { Region } from 'react-native-maps';
import type { MapMarkerFilters } from '../../hooks';
import type { UserLocation } from '../../hooks/useUserLocation';
import type { MapPoint, MapPointCheckin, PolylineCoordinate } from '../../types';
import { MapViewMode } from '../../store/useMapStore';
import { ReactNode } from 'react';

/**
 * Props for NHSMap.
 */
export interface NHSMapProps<T extends MapPoint = MapPoint> {
  /**
   * Called when a marker/check-in marker is pressed.
   */
  onMarkerPress?: (point: T) => void;

  /**
   * Selected point id used for selection-driven marker UI states. (Currently not used because of glitches)
   */
  selectedPointId?: string | null;

  /**
   * Map points rendered as parent markers and optional nested check-in markers.
   */
  mapPoints?: T[];

  /**
   * Current user location for user marker and follow-user camera behavior.
   * Recommended source: useUserLocation().location.
   */
  userLocation?: UserLocation | null;

  /**
   * Previous user location used for distance threshold checks before refetching check-ins.
   * Recommended source: useUserLocation().previousLocation.
   */
  previousLocation?: UserLocation | null;

  /**
   * Fetches nearby check-in points around the current coordinates.
   * Recommended source: useUserLocation().syncNearbyGeofences.
   */
  syncNearbyGeofences?: (latitude: number, longitude: number) => Promise<MapPointCheckin[]>;

  /**
   * Emits the active nearby check-in point (or null) to parent.
   * Recommended source: useMapScreenController().setActivePoint.
   */
  onActiveCheckinPointChange?: (point: MapPointCheckin | null) => void;

  /**
   * Loading state for user-location related controls.
   * Recommended source: useUserLocation().isLoading.
   */
  isLocationLoading?: boolean;

  /**
   * Starts location tracking when follow-user is toggled.
   * Recommended source: useUserLocation().startTracking.
   */
  startTrackingCallback?: () => void;

  /**
   * Called when map reports ready state.
   * Recommended source: useMapNavigationGuidance().onMapReady.
   */
  onMapReadyCallback?: () => void;

  /**
   * Decoded polyline coordinates for active navigation route.
   * Recommended source: decodeRoutePolyline(...) result from MapScreen.
   */
  navigationPolylineCoordinates: PolylineCoordinate[];

  /**
   * Controls whether navigation polyline is visible.
   * Recommended source: navigationPolylineCoordinates.length >= 2.
   */
  isNavPolylineVisible?: boolean;

  /**
   * Enables/disables pan/zoom/rotate/pitch map gestures.
   * Recommended source: screen UI state (normally true).
   */
  isMapInteractionEnabled?: boolean;

  /**
   * Marker category filters.
   * Recommended source: useMapMarkerFilters().filters.
   */
  markerFilters?: MapMarkerFilters;

  /**
   * Enables check-in proximity detection and nearby check-in synchronization.
   * Recommended source: screen mode flag (true on check-in capable map screens).
   */
  enableCheckinMode?: boolean;

  /**
   * Specify which view mode the map is in, which will help hide specific element on the map
   */
  viewMode: MapViewMode;

  /**
   * Render a custom marker.
   *
   * Note: You have to write your own <Marker/> and <MarkerVisual/> component to use this. You can refer to DynamicMarkerVisual as an example.
   */
  renderMarker?: (point: MapPoint, shouldDisplayMarkerName: boolean) => ReactNode;
}

/**
 * Imperative API exposed by NHSMap via ref.
 */
export interface NHSMapRef {
  /** Animate camera to a target region. */
  animateToRegion: (region: Region, duration?: number) => void;

  /** Animate camera to a coordinate with optional explicit deltas. */
  animateToCoordinate: (
    coordinate: { latitude: number; longitude: number; latDelta?: number; lngDelta?: number },
    duration?: number
  ) => void;

  /** Fit camera bounds to a set of coordinates with optional edge padding. */
  fitToCoordinates: (
    coordinates: { latitude: number; longitude: number }[],
    edgePadding?: { top: number; right: number; bottom: number; left: number },
    animated?: boolean
  ) => void;

  /** Programmatically toggle follow-user mode. */
  setFollowUser: (follow: boolean) => void;

  /** Returns current follow-user mode state. */
  isFollowingUser: () => boolean;

  /** Set map zoom delta around current center. */
  setZoom: (zoom: number) => void;

  /** Force map remount/reload. */
  reloadMap: () => void;
}
