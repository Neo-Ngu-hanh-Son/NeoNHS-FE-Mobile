import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { logger } from '@/utils/logger';

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

/**
 * Permission status for location
 */
export type LocationPermissionStatus = 'undetermined' | 'granted' | 'denied';

/**
 * Return type for useUserLocation hook
 */
export interface UseUserLocationReturn {
  /** Current user location, null if not available */
  location: UserLocation | null;
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
}

/**
 * Options for useUserLocation hook
 */
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
          setLocation(userLocation);
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
    isTracking,
    permissionStatus,
    error,
    isLoading,
    startTracking,
    stopTracking,
    requestPermission,
    getCurrentLocation,
  };
}

export default useUserLocation;
