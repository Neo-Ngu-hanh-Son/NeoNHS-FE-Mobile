import { MapPoint } from '../../types';

// ─── Formatting ──────────────────────────────────────────────────────────────

export function hexAlpha(hex: string, alpha: string): string {
  const base = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  return `${base}${alpha}`;
}

export function formatDateTime(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatParticipants(current?: number, max?: number): string {
  if (typeof current !== 'number' && typeof max !== 'number') return '';
  if (typeof current === 'number' && typeof max === 'number') return `${current} / ${max}`;
  return String(current ?? max ?? '');
}

export function formatEstTime(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `~${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
}

export function resolveTypeLabel(type: MapPoint['type']): string {
  const map: Partial<Record<MapPoint['type'], string>> = {
    PAGODA: 'Pagoda',
    CAVE: 'Cave',
    VIEWPOINT: 'Viewpoint',
    GENERAL: 'General',
    CHECKIN: 'Check-in',
    STATUE: 'Statue / Monument',
    GATE: 'Gate',
    SHOP: 'Shop',
    ELEVATOR: 'Elevator',
    EVENT: 'Event',
    WORKSHOP: 'Workshop',
    ATTRACTION: 'Attraction',
    DEFAULT: 'Point',
    USER_CHECKIN: 'Your Check-in',
  };
  return map[type] ?? 'Point';
}

// ─── Status ──────────────────────────────────────────────────────────────────

export type StatusInfo = { label: string; color: string; bg: string; icon: string };

function isEnded(point: MapPoint): boolean {
  if (!point.endTime) return false;
  const end = new Date(point.endTime);
  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
}

function isOngoing(point: MapPoint): boolean {
  if (!point.startTime || !point.endTime) return false;
  const now = Date.now();
  const start = new Date(point.startTime);
  const end = new Date(point.endTime);
  return (
    !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start.getTime() <= now && end.getTime() > now
  );
}

export function resolveStatus(point: MapPoint): StatusInfo | null {
  if (point.type !== 'EVENT' && point.type !== 'WORKSHOP') return null;
  if (isOngoing(point)) {
    return { label: 'Ongoing', color: '#10b981', bg: '#10b98118', icon: 'radio-button-on' };
  }
  if (isEnded(point)) {
    return { label: 'Ended', color: '#64748b', bg: '#64748b18', icon: 'checkmark-circle' };
  }
  return { label: 'Upcoming', color: '#f59e0b', bg: '#f59e0b18', icon: 'time-outline' };
}
