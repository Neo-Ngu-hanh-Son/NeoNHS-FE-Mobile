import { decode } from '@googlemaps/polyline-codec';
import { MapPointCheckin, Maneuver, PolylineCoordinate } from './types';

type ManeuverPresentation = {
  iconName: string;
  label: string;
};

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

export const getManeuverPresentation = (maneuver?: Maneuver | null): ManeuverPresentation => {
  switch (maneuver) {
    case 'DEPART':
      return { iconName: 'navigate', label: 'Depart' };
    case 'TURN_LEFT':
      return { iconName: 'arrow-back', label: 'Turn left' };
    case 'TURN_RIGHT':
      return { iconName: 'arrow-forward', label: 'Turn right' };
    case 'TURN_SLIGHT_LEFT':
      return { iconName: 'arrow-undo', label: 'Slight left' };
    case 'TURN_SLIGHT_RIGHT':
      return { iconName: 'arrow-redo', label: 'Slight right' };
    case 'TURN_SHARP_LEFT':
      return { iconName: 'return-up-back', label: 'Sharp left' };
    case 'TURN_SHARP_RIGHT':
      return { iconName: 'return-up-forward', label: 'Sharp right' };
    case 'UTURN_LEFT':
    case 'UTURN_RIGHT':
      return { iconName: 'return-up-back', label: 'Make a U-turn' };
    case 'STRAIGHT':
      return { iconName: 'arrow-up', label: 'Go straight' };
    case 'RAMP_LEFT':
      return { iconName: 'trending-back', label: 'Take left ramp' };
    case 'RAMP_RIGHT':
      return { iconName: 'trending-forward', label: 'Take right ramp' };
    case 'MERGE':
      return { iconName: 'git-merge', label: 'Merge' };
    case 'FORK_LEFT':
      return { iconName: 'git-branch', label: 'Keep left' };
    case 'FORK_RIGHT':
      return { iconName: 'git-branch', label: 'Keep right' };
    case 'FERRY':
      return { iconName: 'boat', label: 'Take ferry' };
    case 'ROUNDABOUT_LEFT':
    case 'ROUNDABOUT_RIGHT':
      return { iconName: 'sync-circle', label: 'Enter roundabout' };
    case 'NAME_CHANGE':
      return { iconName: 'swap-horizontal', label: 'Continue' };
    case 'MANEUVER_UNSPECIFIED':
    default:
      return { iconName: 'navigate', label: 'Continue' };
  }
};


export const formatDurationText = (duration?: string): string | undefined => {
  if (!duration) {
    return undefined;
  }

  const seconds = Number.parseInt(duration.replace('s', ''), 10);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return undefined;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.max(1, Math.round((seconds % 3600) / 60));

  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }

  return `${minutes} min`;
};

export const formatDistanceText = (distanceMeters?: number): string | undefined => {
  if (typeof distanceMeters !== 'number' || distanceMeters <= 0) {
    return undefined;
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
};



export function parseDurationSeconds(duration?: string): number | undefined {
  if (!duration) {
    return undefined;
  }

  const parsed = Number.parseInt(duration.replace('s', ''), 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return undefined;
  }

  return parsed;
}

export function extractStreetNameFromInstruction(instruction?: string): string | undefined {
  if (!instruction) {
    return undefined;
  }

  const match = instruction.match(/\b(?:onto|on|toward|towards)\s+([^,.;]+)/i);
  const streetName = match?.[1]?.trim();
  return streetName && streetName.length > 0 ? streetName : undefined;
}