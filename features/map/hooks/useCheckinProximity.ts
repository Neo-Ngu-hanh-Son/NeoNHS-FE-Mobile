import { useMemo } from 'react';
import { UserLocation } from './useUserLocation';
import { MapPointCheckin } from '../types';
import * as turf from '@turf/turf';
import MAP_CONSTANTS from '../constants';

export const useCheckinProximity = (
  userLocation: UserLocation | null | undefined,
  points: MapPointCheckin[] | null,
  thresholdMeters?: number,
  isGuidanceMode?: boolean
): MapPointCheckin | null => {
  return useMemo(() => {
    if (isGuidanceMode) return null;
    if (!userLocation || !points || points.length === 0) return null;

    const threshold = thresholdMeters ?? MAP_CONSTANTS.CHECKINPOINT_DETECT_RADIUS_M;

    let closest: MapPointCheckin | null = null;
    let closestDistance = Infinity;

    for (const point of points) {
      let coord1 = turf.point([userLocation.longitude, userLocation.latitude]);
      let coord2 = turf.point([point.longitude, point.latitude]);
      const distance = turf.distance(coord1, coord2);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = point;
      }
    }

    if (closest && closestDistance <= threshold) {
      return closest;
    }

    return null;
  }, [userLocation, points, thresholdMeters, isGuidanceMode]);
};
