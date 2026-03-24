import { decode } from '@googlemaps/polyline-codec';
import { MapPointCheckin, PolylineCoordinate } from './types';

export const hasCheckinPointsChanged = (
  current: MapPointCheckin[],
  next: MapPointCheckin[]
): boolean => {
  if (current.length !== next.length) return true;

  for (let i = 0; i < current.length; i += 1) {
    if (current[i].id !== next[i].id) {
      return true;
    }
  }

  return false;
};

export const decodeRoutePolyline = (encodedPolyline: string): PolylineCoordinate[] => {
  if (!encodedPolyline) {
    return [];
  }

  return decode(encodedPolyline, 5).map(([latitude, longitude]) => ({ latitude, longitude }));
};