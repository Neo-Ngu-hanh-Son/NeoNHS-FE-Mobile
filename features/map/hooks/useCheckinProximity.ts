import { useMemo } from 'react';
import { getDistance } from 'geolib';
import { UserLocation } from './useUserLocation';
import { MapPointCheckin, mapConstants } from '../types';

export const useCheckinProximity = (
  userLocation: UserLocation | null,
  points: MapPointCheckin[] | null,
  thresholdMeters?: number
): MapPointCheckin | null => {
  return useMemo(() => {
    if (!userLocation || !points || points.length === 0) return null;

    const threshold = thresholdMeters ?? mapConstants.checkinPointDetectRadiusMeters;

    let closest: MapPointCheckin | null = null;
    let closestDistance = Infinity;

    for (const point of points) {
      const distance = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: point.latitude, longitude: point.longitude }
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = point;
      }
    }

    if (closest && closestDistance <= threshold) {
      return closest;
    }

    return null;
  }, [userLocation, points, thresholdMeters]);
};
