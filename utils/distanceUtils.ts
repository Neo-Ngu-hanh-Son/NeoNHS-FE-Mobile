import { Step } from '@/features/map';
import * as turf from '@turf/turf';

export const distanceUtils = {
  calculateDistance: (
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ) => {
    let from = turf.point([point1.longitude, point1.latitude]);
    let to = turf.point([point2.longitude, point2.latitude]);
    return turf.distance(from, to);
  },

  calculatePointToLineDistance: (
    point: { latitude: number; longitude: number },
    lineStart: { latitude: number; longitude: number },
    lineEnd: { latitude: number; longitude: number }
  ) => {
    let pt = turf.point([point.longitude, point.latitude]);
    let line = turf.lineString([
      [lineStart.longitude, lineStart.latitude],
      [lineEnd.longitude, lineEnd.latitude]
    ]);
    return turf.pointToLineDistance(pt, line);
  },

  findCurrentUserStepIndex: (
    userLocation: { latitude: number; longitude: number },
    currentStepIndex: number,
    steps: Step[]
  ): number => {
    if (steps.length === 0) {
      return 0;
    }

    const boundedCurrentStepIndex = Math.min(Math.max(currentStepIndex, 0), steps.length - 1);
    const userPoint = turf.point([userLocation.longitude, userLocation.latitude]);

    // Check around current step in both directions so guidance can move backward and forward.
    const stepsToCheck: number[] = [];
    for (let offset = -2; offset <= 2; offset += 1) {
      stepsToCheck.push(boundedCurrentStepIndex + offset);
    }

    let closestDistance = Infinity;
    let closestStepIndex = boundedCurrentStepIndex;

    stepsToCheck.forEach((index) => {
      if (index >= 0 && index < steps.length) {
        const step = steps[index];
        const stepLine = turf.lineString([
          [step.startLocation.latLng.longitude, step.startLocation.latLng.latitude],
          [step.endLocation.latLng.longitude, step.endLocation.latLng.latitude]
        ]);
        const distance = turf.pointToLineDistance(userPoint, stepLine);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestStepIndex = index;
        }
      }
    });

    return closestStepIndex;
  }
}