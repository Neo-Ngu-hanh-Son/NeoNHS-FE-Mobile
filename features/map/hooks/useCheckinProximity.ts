import { useMemo } from 'react';
import { getDistance } from 'geolib';
import { UserLocation } from './useUserLocation';
import { MapPointCheckin } from '../types';
import { mapConstants } from '../mapConstants';
import { logger } from '@/utils/logger';

export const useCheckinProximity = (
  userLocation: UserLocation | null,
  points: MapPointCheckin[] | null,
  thresholdMeters: number | undefined
): MapPointCheckin | null => {
  return useMemo(() => {
    if (!userLocation || !points || points.length === 0) return null;
    const threshold = thresholdMeters ?? mapConstants.checkinPointDetectRadiusMeters;

    // Find the closest point (backend already remove the point that user checkedin.)
    const closest = points
      .map((point) => ({
        ...point,
        distance: getDistance(
          { latitude: userLocation.latitude, longitude: userLocation.longitude },
          { latitude: point.latitude, longitude: point.longitude }
        ),
      }))
      .sort((a, b) => a.distance - b.distance)[0];

    // If the closest point is within the threshold, return it.
    if (closest && closest.distance <= threshold) {
      return closest;
    }

    return null;
  }, [userLocation, points, thresholdMeters]);
};
