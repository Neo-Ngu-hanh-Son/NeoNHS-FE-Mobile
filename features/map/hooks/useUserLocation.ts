import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { logger } from '@/utils/logger';
import checkinServices from '../services/checkinServices';
import { mapConstants } from '../mapConstants';
import { MapPointCheckin } from '../types';
import { LatLng } from 'react-native-maps';
import * as geolib from 'geolib';

const GEOFENCING_TASK = 'CHECKIN_GEOFENCE_TASK';

/**
 * User location data structure
 */
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied';

export interface UseUserLocationReturn {
  /** Current user location, null if not available */
  location: UserLocation | null;
  /** Previous user location, useful for calculating distance moved */
  previousLocation: UserLocation | null;
  /** Whether location is currently being tracked */
  isTracking: boolean;
  /** Current permission status */
  permissionStatus: LocationPermissionStatus;
  /** Error message if any */
  error: string | null;
  /** Whether location is currently being fetched */
  isLoading: boolean;
  /** Start tracking user location */
  startTracking: () => Promise<void>;
  /** Stop tracking user location */
  stopTracking: () => void;
  /** Request location permission */
  requestPermission: () => Promise<boolean>;
  /** Get current location once (without continuous tracking) */
  getCurrentLocation: () => Promise<UserLocation | null>;
  /** Synchronize nearby geofences so that user will get a notification when entering/exiting */
  syncNearbyGeofences: (latitude: number, longitude: number) => Promise<MapPointCheckin[]>;
  /** Calculate distance in meters between two points */
  calculateDistance: (point1: LatLng, point2: LatLng) => number;
}

export interface UseUserLocationOptions {
  /** Whether to start tracking immediately on mount */
  autoStart?: boolean;
  /** Accuracy level for location tracking */
  accuracy?: Location.Accuracy;
  /** Update interval in milliseconds */
  updateInterval?: number;
  /** Minimum distance (in meters) to trigger update */
  distanceInterval?: number;
}

const DEFAULT_OPTIONS: UseUserLocationOptions = {
  autoStart: false,
  accuracy: Location.Accuracy.High,
  updateInterval: 3000,
  distanceInterval: 5,
};

/**
 * Custom hook for tracking user location
 *
 * @example
 * ```tsx
 * const { location, isTracking, startTracking, stopTracking } = useUserLocation({
 *   autoStart: true,
 *   accuracy: Location.Accuracy.High,
 * });
 * ```
 */
export function useUserLocation(options: UseUserLocationOptions = {}): UseUserLocationReturn {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [previousLocation, setPreviousLocation] = useState<UserLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<LocationPermissionStatus>('undetermined');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  /**
   * Check current permission status
   */
  const checkPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const mappedStatus: LocationPermissionStatus =
        status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
      setPermissionStatus(mappedStatus);
      return mappedStatus;
    } catch (err) {
      logger.error('Failed to check location permission:', err);
      return 'undetermined';
    }
  }, []);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';

      setPermissionStatus(granted ? 'granted' : 'denied');

      if (!granted) {
        setError('Location permission denied');
      }

      // Additionally request to send notification for geofencing if permission is granted (Optional)
      if (granted) {
        const { status: notificationStatus } = await Location.requestBackgroundPermissionsAsync();
        if (notificationStatus !== 'granted') {
          logger.warn(
            'Background location permission not granted, geofencing notifications may not work properly'
          );
        }

        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          logger.warn(
            'Background location permission not granted, geofencing may not work properly'
          );
        }
      }

      return granted;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to request permission';
      logger.error('Failed to request location permission:', err);
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get current location once
   */
  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check permission first
      const status = await checkPermission();
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          return null;
        }
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: mergedOptions.accuracy,
      });

      const userLocation: UserLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        heading: currentLocation.coords.heading,
        speed: currentLocation.coords.speed,
        timestamp: currentLocation.timestamp,
      };

      setLocation(userLocation);
      return userLocation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get current location';
      logger.error('Failed to get current location:', err);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkPermission, requestPermission, mergedOptions.accuracy]);

  /**
   * Start continuous location tracking
   */
  const startTracking = useCallback(async (): Promise<void> => {
    if (isTracking) {
      logger.info('Location tracking already active');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check permission first
      const status = await checkPermission();
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          return;
        }
      }

      // Start watching position
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: mergedOptions.accuracy,
          timeInterval: mergedOptions.updateInterval,
          distanceInterval: mergedOptions.distanceInterval,
        },
        (newLocation: Location.LocationObject) => {
          const userLocation: UserLocation = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            timestamp: newLocation.timestamp,
          };

          // Use functional state update so previousLocation always reflects the latest value,
          // avoiding stale closure reads when the watcher callback keeps running.
          setLocation((currentLocation) => {
            setPreviousLocation(currentLocation);
            return userLocation;
          });
          setError(null);
        }
      );

      setIsTracking(true);
      logger.info('Location tracking started');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start location tracking';
      logger.error('Failed to start location tracking:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [isTracking, checkPermission, requestPermission, mergedOptions]);

  /**
   * Stop location tracking
   */
  const stopTracking = useCallback((): void => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setIsTracking(false);
    logger.info('Location tracking stopped');
  }, []);

  const syncNearbyGeofences = async (latitude: number, longitude: number) => {
    let nearbyPoints: MapPointCheckin[] = [];
    try {
      nearbyPoints = (
        await checkinServices.getNearbyCheckIns(
          latitude,
          longitude,
          mapConstants.checkinPointDetectRadiusMeters
        )
      ).data;
      const regions = nearbyPoints.map((point) => ({
        identifier: point.id, // Your UUID from backend
        latitude: point.latitude,
        longitude: point.longitude,
        radius: mapConstants.checkinPointDetectRadiusMeters,
        notifyOnEnter: true,
        notifyOnExit: false,
      }));

      let gateKeep = false;

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        logger.warn(
          'Notifications permission not granted, geofencing notifications may not work properly'
        );
      }
      const { status: notificationStatus } = await Location.requestBackgroundPermissionsAsync();
      if (notificationStatus !== 'granted') {
        logger.warn('Background location permission not granted, stopping geofencing');
        gateKeep = true;
      }

      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        logger.warn('Background location permission not granted, stopping geofencing');
        gateKeep = true;
      }

      if (regions.length > 0 && !gateKeep) {
        await Location.startGeofencingAsync(GEOFENCING_TASK, regions);
      }
    } catch (err) {
      logger.error('Failed to sync geofences', err);
      return [];
    } finally {
      // Still return the nearby points even if geofencing setup fails
      logger.debug('Returning nearby check-in points length: ' + nearbyPoints.length);
      return nearbyPoints;
    }
  };

  const calculateDistance = (
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ) => {
    return geolib.getDistance(
      { latitude: point1.latitude, longitude: point1.longitude },
      { latitude: point2.latitude, longitude: point2.longitude }
    );
  };

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-start tracking if enabled
  useEffect(() => {
    if (mergedOptions.autoStart) {
      startTracking();
    }
  }, [mergedOptions.autoStart]); // Intentionally only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
    };
  }, []);

  return {
    location,
    previousLocation,
    isTracking,
    permissionStatus,
    error,
    isLoading,
    startTracking,
    stopTracking,
    requestPermission,
    getCurrentLocation,
    syncNearbyGeofences,
    calculateDistance,
  };
}

export default useUserLocation;
