import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as Location from 'expo-location';
import { logger } from '@/utils/logger';
import checkinServices from '../services/checkinServices';
import { MapPointCheckin } from '../types';
import MAP_CONSTANTS from '../constants';
import { useFocusEffect } from '@react-navigation/native';
import { distanceUtils } from '@/utils/distanceUtils';

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
  updateInterval: MAP_CONSTANTS.UPDATE_USER_LOCATION_THROTTLE_MS,
  distanceInterval: 0,
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
  const mergedOptions = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [previousLocation, setPreviousLocation] = useState<UserLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('undetermined');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const isTrackingRef = useRef(false);

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
    if (isTrackingRef.current) {
      // logger.info('Location tracking already active');
      return;
    }
    isTrackingRef.current = true;
    try {
      setIsLoading(true);
      setError(null);

      // Check permission first
      const status = await checkPermission();
      if (status !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          setError('Location permission is required to start tracking');
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

          setLocation((currentLocation) => {
            if (!currentLocation) {
              setPreviousLocation(null);
              return userLocation;
            }

            const distance = distanceUtils.calculateDistance(currentLocation, userLocation);
            if (distance < MAP_CONSTANTS.DISTANCE_BEFORE_UPDATE_USER_LOCATION_M) {
              return currentLocation;
            }

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
  }, [
    checkPermission,
    requestPermission,
    mergedOptions.accuracy,
    mergedOptions.updateInterval,
    mergedOptions.distanceInterval,
  ]);

  /**
   * Stop location tracking
   */
  const stopTracking = useCallback((): void => {
    const hadSubscription = locationSubscription.current != null;

    if (locationSubscription.current) {
      logger.info('Location tracking stopped');
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }

    isTrackingRef.current = false;
    setIsTracking((wasTracking) => {
      if (wasTracking || hadSubscription) {
      }
      return false;
    });
  }, []);

  const syncNearbyGeofences = useCallback(async (latitude: number, longitude: number) => {
    try {
      const nearbyPoints = (
        await checkinServices.getNearbyCheckIns(latitude, longitude, MAP_CONSTANTS.CHECKINPOINT_DETECT_RADIUS_M)
      ).data;

      // logger.debug('Check-in points near user: ' + nearbyPoints.length);

      return nearbyPoints;
    } catch (err) {
      logger.error('Failed to sync geofences', err);
      return [];
    }
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Keep the latest startTracking callback without making the auto-start
  // effect depend on callback identity.
  const startTrackingRef = useRef(startTracking);
  useEffect(() => {
    startTrackingRef.current = startTracking;
  }, [startTracking]);

  // Auto-start tracking if enabled (on mount only).
  // Keeping this mount-scoped prevents unintended restarts when consumers
  // explicitly stop tracking (e.g. on screen blur).
  // Revert to normal useEffect if you experiencing weird stuff
  useFocusEffect(
    useCallback(() => {
      if (mergedOptions.autoStart) {
        startTracking();
      }

      return () => {
        stopTracking();
      };
    }, [startTracking, stopTracking, mergedOptions.autoStart])
  );

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
  };
}

export default useUserLocation;
