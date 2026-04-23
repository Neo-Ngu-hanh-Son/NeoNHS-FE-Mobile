import { Step } from '@/features/map';
import MAP_CONSTANTS from '@/features/map/constants';
import * as turf from '@turf/turf';
import { logger } from './logger';

const calculateDistance = (
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
) => {
  const from = turf.point([point1.longitude, point1.latitude]);
  const to = turf.point([point2.longitude, point2.latitude]);
  return turf.distance(from, to, {
    units: 'meters',
  });
};

const calculatePointToLineDistance = (
  point: { latitude: number; longitude: number },
  lineStart: { latitude: number; longitude: number },
  lineEnd: { latitude: number; longitude: number }
) => {
  const pt = turf.point([point.longitude, point.latitude]);
  const line = turf.lineString([
    [lineStart.longitude, lineStart.latitude],
    [lineEnd.longitude, lineEnd.latitude],
  ]);
  return turf.pointToLineDistance(pt, line);
};

const findCurrentUserStepIndex = (
  userLocation: { latitude: number; longitude: number },
  currentStepIndex: number,
  steps: Step[]
): number => {
  if (steps.length === 0) return 0;

  const boundedCurrentStepIndex = Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
  const userPoint = turf.point([userLocation.longitude, userLocation.latitude]);

  let closestDistance = Infinity;
  let closestStepIndex = boundedCurrentStepIndex;

  // Check neighbors (-2 to +2) to allow for forward/backward movement
  for (let offset = -2; offset <= 2; offset++) {
    const index = boundedCurrentStepIndex + offset;
    if (index >= 0 && index < steps.length) {
      const step = steps[index];
      const stepLine = turf.lineString([
        [step.startLocation.latLng.longitude, step.startLocation.latLng.latitude],
        [step.endLocation.latLng.longitude, step.endLocation.latLng.latitude],
      ]);

      const distance = turf.pointToLineDistance(userPoint, stepLine);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestStepIndex = index;
      }
    }
  }

  return closestStepIndex;
};

const hasUserArrivedAtDestination = (
  userLocation: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): boolean => {
  const distance = calculateDistance(userLocation, destination);
  return distance <= MAP_CONSTANTS.ARRIVAL_RADIUS_M;
};

/**
 * List of distance-related utility functions that use the turf.js library
 */
export const distanceUtils = {
  calculateDistance,
  calculatePointToLineDistance,
  findCurrentUserStepIndex,
  hasUserArrivedAtDestination,
};
