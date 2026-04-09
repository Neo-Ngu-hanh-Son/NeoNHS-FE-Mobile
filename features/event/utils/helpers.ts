import { EventMapPoint } from '@/features/map';
import { TicketCatalogStatus, EventPointTagResponse, EventResponse, EventTimelineGroupResponse } from '../types';

export function getStatusColor(status: string): string {
  switch (status) {
    case 'UPCOMING':
      return '#3b82f6';
    case 'ONGOING':
      return '#10b981';
    case 'COMPLETED':
      return '#6b7280';
    case 'CANCELLED':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export function getTicketStatusColor(status: TicketCatalogStatus): string {
  switch (status) {
    case TicketCatalogStatus.ACTIVE:
      return '#10b981';
    case TicketCatalogStatus.SOLD_OUT:
      return '#ef4444';
    case TicketCatalogStatus.INACTIVE:
      return '#6b7280';
    default:
      return '#6b7280';
  }
}

export function getTicketStatusLabel(status: TicketCatalogStatus): string {
  switch (status) {
    case TicketCatalogStatus.ACTIVE:
      return 'On Sale';
    case TicketCatalogStatus.SOLD_OUT:
      return 'Sold Out';
    case TicketCatalogStatus.INACTIVE:
      return 'Unavailable';
    default:
      return status;
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatPrice(price: number): string {
  return price.toLocaleString('vi-VN') + 'đ';
}

export function calcDiscount(price: number, originalPrice?: number | null): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function formatDaysOfWeek(days?: string | null): string {
  if (!days) return 'All days';
  const dayMap: Record<string, string> = {
    MON: 'Mon',
    TUE: 'Tue',
    WED: 'Wed',
    THU: 'Thu',
    FRI: 'Fri',
    SAT: 'Sat',
    SUN: 'Sun',
  };
  return days
    .split(',')
    .map((d) => dayMap[d.trim()] || d.trim())
    .join(', ');
}

type UnknownRecord = Record<string, unknown>;

const UNSCHEDULED_DATE_KEY = 'unscheduled';

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeDateKey(value?: string | null): string {
  if (!value) {
    return UNSCHEDULED_DATE_KEY;
  }

  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return value;
  }

  return asDate.toISOString().slice(0, 10);
}

function readEventArray(raw: unknown): EventResponse[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.filter(isRecord).map((event) => event as unknown as EventResponse);
}

function normalizeTimelineGroup(rawGroup: unknown): EventTimelineGroupResponse | null {
  if (!isRecord(rawGroup)) {
    return null;
  }

  const dateCandidate =
    (typeof rawGroup.date === 'string' && rawGroup.date) ||
    (typeof rawGroup.day === 'string' && rawGroup.day) ||
    (typeof rawGroup.groupDate === 'string' && rawGroup.groupDate) ||
    null;

  const events = readEventArray(rawGroup.events ?? rawGroup.items ?? rawGroup.content);

  return {
    date: normalizeDateKey(dateCandidate),
    events,
  };
}

/**
 * Normalizes various grouped timeline payload shapes from backend to a stable array model.
 */
export function normalizeEventTimelineGroups(payload: unknown): EventTimelineGroupResponse[] {
  if (Array.isArray(payload)) {
    return payload.map(normalizeTimelineGroup).filter((group): group is EventTimelineGroupResponse => group !== null);
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.groups)) {
    return payload.groups
      .map(normalizeTimelineGroup)
      .filter((group): group is EventTimelineGroupResponse => group !== null);
  }

  const groupedMap = payload.grouped ?? payload.timelines;
  if (isRecord(groupedMap)) {
    return Object.entries(groupedMap).map(([date, events]) => ({
      date: normalizeDateKey(date),
      events: readEventArray(events),
    }));
  }

  return [];
}

/**
 * Normalize point-tag payload variations to a consistent tag array.
 */
export function normalizeEventPointTags(payload: unknown): EventPointTagResponse[] {
  if (Array.isArray(payload)) {
    return payload
      .filter(isRecord)
      .map((tag) => ({
        id: String(tag.id ?? tag.name ?? ''),
        name: String(tag.name ?? ''),
        description: typeof tag.description === 'string' ? tag.description : null,
        tagColor: typeof tag.tagColor === 'string' ? tag.tagColor : null,
        iconUrl: typeof tag.iconUrl === 'string' ? tag.iconUrl : null,
      }))
      .filter((tag) => tag.id.length > 0 && tag.name.length > 0);
  }

  if (isRecord(payload) && Array.isArray(payload.tags)) {
    return normalizeEventPointTags(payload.tags);
  }

  return [];
}

function parseCoordinate(value?: string | number | null): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : -1;
  }

  return -1;
}

function mapEventToMapPoint(event: EventResponse): EventMapPoint {
  const primaryTag = event.tags?.[0];

  return {
    id: event.id,
    name: event.name,
    description: event.shortDescription ?? event.fullDescription ?? undefined,
    shortDescription: event.shortDescription ?? undefined,
    thumbnailUrl: event.thumbnailUrl ?? undefined,
    latitude: parseCoordinate(event.latitude),
    longitude: parseCoordinate(event.longitude),
    type: 'EVENT',
    startTime: event.startTime ?? undefined,
    endTime: event.endTime ?? undefined,
    maxParticipants: event.maxParticipants ?? undefined,
    currentEnrolled: event.currentEnrolled ?? undefined,
    eventPointTag: {
      id: primaryTag?.id ?? 'default-event-tag',
      name: primaryTag?.name ?? 'Event',
      description: primaryTag?.description,
      color: primaryTag?.tagColor,
      iconUrl: primaryTag?.iconUrl,
    },
  };
}

/**
 * Builds deduplicated event map points from grouped timelines.
 */
export function buildEventMapPointsFromGroups(groups: EventTimelineGroupResponse[]): EventMapPoint[] {
  const pointMap = new Map<string, EventMapPoint>();

  groups.forEach((group) => {
    group.events.forEach((event) => {
      if (!event.id) {
        return;
      }

      pointMap.set(event.id, mapEventToMapPoint(event));
    });
  });

  return Array.from(pointMap.values());
}

/**
 * Derives unique point tags from grouped timelines.
 */
export function deriveEventPointTagsFromGroups(groups: EventTimelineGroupResponse[]): EventPointTagResponse[] {
  const tagMap = new Map<string, EventPointTagResponse>();

  groups.forEach((group) => {
    group.events.forEach((event) => {
      event.tags?.forEach((tag) => {
        if (!tag.id || !tag.name) {
          return;
        }

        tagMap.set(tag.id, {
          id: tag.id,
          name: tag.name,
          description: tag.description,
          tagColor: tag.tagColor,
          iconUrl: tag.iconUrl,
        });
      });
    });
  });

  return Array.from(tagMap.values());
}

/**
 * Build day options from grouped timeline response.
 */
export function buildEventTimelineDayOptions(groups: EventTimelineGroupResponse[]) {
  const sortedGroups = [...groups].sort((left, right) => left.date.localeCompare(right.date));

  return sortedGroups.map((group) => ({
    date: group.date,
    label:
      group.date === UNSCHEDULED_DATE_KEY
        ? 'Unscheduled'
        : new Date(`${group.date}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
          }),
    eventCount: group.events.length,
  }));
}

/**
 * Lightweight search filter for event map points.
 */
export function filterEventMapPointsBySearch(points: EventMapPoint[], query: string): EventMapPoint[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return points.filter((point) => {
    const name = point.name.trim().toLowerCase();
    const description = (point.description ?? '').trim().toLowerCase();
    return name.includes(normalizedQuery) || description.includes(normalizedQuery);
  });
}
