import { decode } from '@googlemaps/polyline-codec';
import { MapPointCheckin, Maneuver, PolylineCoordinate } from '../types';

type ManeuverPresentation = {
  iconName: string;
  label: string;
};

export const hasCheckinPointsChanged = (current: MapPointCheckin[], next: MapPointCheckin[]): boolean => {
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
      return { iconName: 'navigate', label: 'Khởi hành' };
    case 'TURN_LEFT':
      return { iconName: 'arrow-back', label: 'Rẽ trái' };
    case 'TURN_RIGHT':
      return { iconName: 'arrow-forward', label: 'Rẽ phải' };
    case 'TURN_SLIGHT_LEFT':
      return { iconName: 'arrow-undo', label: 'Rẽ trái nhẹ' };
    case 'TURN_SLIGHT_RIGHT':
      return { iconName: 'arrow-redo', label: 'Rẽ phải nhẹ' };
    case 'TURN_SHARP_LEFT':
      return { iconName: 'return-up-back', label: 'Rẽ trái gắt' };
    case 'TURN_SHARP_RIGHT':
      return { iconName: 'return-up-forward', label: 'Rẽ phải gắt' };
    case 'UTURN_LEFT':
    case 'UTURN_RIGHT':
      return { iconName: 'return-up-back', label: 'Quay đầu' };
    case 'STRAIGHT':
      return { iconName: 'arrow-up', label: 'Đi thẳng' };
    case 'RAMP_LEFT':
      return { iconName: 'trending-back', label: 'Đi vào lối rẽ trái' };
    case 'RAMP_RIGHT':
      return { iconName: 'trending-forward', label: 'Đi vào lối rẽ phải' };
    case 'MERGE':
      return { iconName: 'git-merge', label: 'Đi vào làn nhập' };
    case 'FORK_LEFT':
      return { iconName: 'git-branch', label: 'Đi sang trái' };
    case 'FORK_RIGHT':
      return { iconName: 'git-branch', label: 'Đi sang phải' };
    case 'FERRY':
      return { iconName: 'boat', label: 'Đi phà' };
    case 'ROUNDABOUT_LEFT':
    case 'ROUNDABOUT_RIGHT':
      return { iconName: 'sync-circle', label: 'Vào vòng xuyến' };
    case 'NAME_CHANGE':
      return { iconName: 'swap-horizontal', label: 'Đi tiếp' };
    case 'MANEUVER_UNSPECIFIED':
    default:
      return { iconName: 'navigate', label: 'Đi tiếp' };
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
  if (!instruction) return undefined;

  // 1. Normalize + remove noise (EN + VI)
  const cleaned = instruction
    .replace(/pass by.*$/i, '')
    .replace(/đi qua.*$/i, '')
    .trim();
  // 2. Try keyword-based extraction (EN + VI)
  const keywordRegex = /\b(?:onto|on|toward|towards|into|to|vào|trên|đến)\s+([^,.;\n]+)/i;
  let street = cleaned.match(keywordRegex)?.[1]?.trim();
  // 3. Fallback: try to extract after last known keyword-like structure
  if (!street) {
    const parts = cleaned
      .split(/,|\n/)
      .map((p) => p.trim())
      .filter(Boolean);
    // Try last meaningful segment
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      // Skip obvious non-street phrases
      if (/^(pass by|đi qua)/i.test(part)) continue;
      street = part;
      break;
    }
  }
  if (!street) return undefined;
  // 4. Final cleanup
  street = street
    .replace(/^(road|street|st\.?|rd\.?|đường)\s+/i, '') // remove prefixes
    .replace(/pass by.*$/i, '')
    .replace(/đi qua.*$/i, '')
    .trim();
  // 5. Reject garbage
  if (street.length < 2 || /^(left|right|straight|rẽ trái|rẽ phải)$/i.test(street)) {
    return undefined;
  }
  return street;
}

export function getFirstInstruction(text: string): string {
  try {
    if (typeof text !== 'string') return text;
    const first = text.split('\n')[0];
    return first ? first.trim() : text;
  } catch (err) {
    return text;
  }
}
