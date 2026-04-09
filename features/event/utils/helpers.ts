import {
  EventMapPoint,
  EventPointResponse,
  EventPointTagResponse,
  EventTimelineGroupResponse,
  EventTimelineResponse,
  TicketCatalogStatus,
} from '../types';

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

function parseImageList(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    const firstImage = value.find((item) => typeof item === 'string');
    return typeof firstImage === 'string' ? firstImage : null;
  }

  return null;
}

function readTimelineArray(raw: unknown): EventTimelineResponse[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw.map(normalizeTimelineItem).filter((timeline): timeline is EventTimelineResponse => timeline !== null);
}

function normalizeEventPoint(rawPoint: unknown): EventPointResponse | null {
  if (!isRecord(rawPoint)) {
    return null;
  }

  const id = typeof rawPoint.id === 'string' ? rawPoint.id : '';
  const name = typeof rawPoint.name === 'string' ? rawPoint.name : '';

  if (!id || !name) {
    return null;
  }

  const eventPointTag = isRecord(rawPoint.eventPointTag)
    ? {
        id: typeof rawPoint.eventPointTag.id === 'string' ? rawPoint.eventPointTag.id : '',
        name: typeof rawPoint.eventPointTag.name === 'string' ? rawPoint.eventPointTag.name : '',
        description: typeof rawPoint.eventPointTag.description === 'string' ? rawPoint.eventPointTag.description : null,
        tagColor: typeof rawPoint.eventPointTag.tagColor === 'string' ? rawPoint.eventPointTag.tagColor : null,
        iconUrl: typeof rawPoint.eventPointTag.iconUrl === 'string' ? rawPoint.eventPointTag.iconUrl : null,
      }
    : null;

  return {
    id,
    name,
    description: typeof rawPoint.description === 'string' ? rawPoint.description : null,
    imageList: parseImageList(rawPoint.imageList),
    latitude: typeof rawPoint.latitude === 'number' || typeof rawPoint.latitude === 'string' ? rawPoint.latitude : null,
    longitude:
      typeof rawPoint.longitude === 'number' || typeof rawPoint.longitude === 'string' ? rawPoint.longitude : null,
    address: typeof rawPoint.address === 'string' ? rawPoint.address : null,
    eventPointTag: eventPointTag && eventPointTag.id && eventPointTag.name ? eventPointTag : null,
  };
}

function normalizeTimelineItem(rawTimeline: unknown): EventTimelineResponse | null {
  if (!isRecord(rawTimeline)) {
    return null;
  }

  const id = typeof rawTimeline.id === 'string' ? rawTimeline.id : '';
  const name = typeof rawTimeline.name === 'string' ? rawTimeline.name : '';
  const date = typeof rawTimeline.date === 'string' ? rawTimeline.date : '';
  const eventId = typeof rawTimeline.eventId === 'string' ? rawTimeline.eventId : '';
  const eventPoint = normalizeEventPoint(rawTimeline.eventPoint);

  if (!id || !name || !date || !eventId || !eventPoint) {
    return null;
  }

  return {
    id,
    name,
    description: typeof rawTimeline.description === 'string' ? rawTimeline.description : null,
    organizer: typeof rawTimeline.organizer === 'string' ? rawTimeline.organizer : null,
    coOrganizer: typeof rawTimeline.coOrganizer === 'string' ? rawTimeline.coOrganizer : null,
    date,
    lunarDate: typeof rawTimeline.lunarDate === 'string' ? rawTimeline.lunarDate : null,
    startTime: typeof rawTimeline.startTime === 'string' ? rawTimeline.startTime : null,
    endTime: typeof rawTimeline.endTime === 'string' ? rawTimeline.endTime : null,
    eventPoint,
    eventId,
  };
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

  const timelines = readTimelineArray(rawGroup.timelines ?? rawGroup.events ?? rawGroup.items ?? rawGroup.content);

  return {
    date: normalizeDateKey(dateCandidate),
    lunarDate: typeof rawGroup.lunarDate === 'string' ? rawGroup.lunarDate : null,
    dayLabel: typeof rawGroup.dayLabel === 'string' ? rawGroup.dayLabel : null,
    timelines,
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
    return Object.entries(groupedMap)
      .map(([date, rawGroup]) => {
        if (isRecord(rawGroup)) {
          const normalized = normalizeTimelineGroup({
            ...rawGroup,
            date: typeof rawGroup.date === 'string' ? rawGroup.date : date,
          });
          return normalized;
        }

        return {
          date: normalizeDateKey(date),
          lunarDate: null,
          dayLabel: null,
          timelines: readTimelineArray(rawGroup),
        } as EventTimelineGroupResponse;
      })
      .filter((group): group is EventTimelineGroupResponse => group !== null);
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

function resolveThumbnail(imageList?: string | null): string | undefined {
  if (!imageList) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(imageList);
    if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
      return parsed[0];
    }
  } catch {
    // Keep fallback behavior for non-JSON image list strings.
  }

  return imageList;
}

function parsePointImages(imageList?: string | null): string[] {
  if (!imageList) {
    return [];
  }

  try {
    const parsed = JSON.parse(imageList);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // Not JSON — treat as a single URL string
  }

  return [imageList];
}

function mapTimelineToMapPoint(timeline: EventTimelineResponse, groupLunarDate?: string | null): EventMapPoint {
  const point = timeline.eventPoint;
  const tag = point.eventPointTag;
  const images = parsePointImages(point.imageList);

  return {
    id: point.id || timeline.id,
    name: point.name || timeline.name,
    description: timeline.description ?? point.description ?? undefined,
    thumbnailUrl: images[0] ?? resolveThumbnail(point.imageList),
    imageList: point.imageList ?? undefined,
    pointImages: images,
    latitude: parseCoordinate(point.latitude),
    longitude: parseCoordinate(point.longitude),
    type: 'EVENT',
    startTime: timeline.startTime ?? undefined,
    endTime: timeline.endTime ?? undefined,
    shortDescription: timeline.description ?? point.description ?? undefined,
    eventId: timeline.eventId,
    address: point.address ?? undefined,
    pointName: point.name,
    pointDescription: point.description ?? undefined,
    timelineId: timeline.id,
    timelineName: timeline.name,
    timelineDescription: timeline.description ?? undefined,
    timelineDate: timeline.date,
    timelineLunarDate: timeline.lunarDate ?? undefined,
    groupLunarDate: groupLunarDate ?? undefined,
    timelineStartTime: timeline.startTime ?? undefined,
    timelineEndTime: timeline.endTime ?? undefined,
    timelineOrganizer: timeline.organizer ?? undefined,
    timelineCoOrganizer: timeline.coOrganizer ?? undefined,
    eventPointTag: {
      id: tag?.id ?? 'default-event-tag',
      name: tag?.name ?? 'Event',
      description: tag?.description ?? null,
      tagColor: tag?.tagColor ?? null,
      color: tag?.tagColor ?? undefined,
      iconUrl: tag?.iconUrl ?? null,
    },
  };
}

/**
 * Builds deduplicated event map points from grouped timelines.
 */
export function buildEventMapPointsFromGroups(groups: EventTimelineGroupResponse[]): EventMapPoint[] {
  const pointMap = new Map<string, EventMapPoint>();

  groups.forEach((group) => {
    group.timelines.forEach((timeline) => {
      const pointId = timeline.eventPoint?.id;
      if (!pointId) {
        return;
      }

      pointMap.set(pointId, mapTimelineToMapPoint(timeline, group.lunarDate));
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
    group.timelines.forEach((timeline) => {
      const tag = timeline.eventPoint?.eventPointTag;
      if (!tag?.id || !tag.name) {
        return;
      }

      tagMap.set(tag.id, {
        id: tag.id,
        name: tag.name,
        description: tag.description ?? null,
        tagColor: tag.tagColor ?? null,
        iconUrl: tag.iconUrl ?? null,
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
    label: group.dayLabel
      ? group.dayLabel
      : group.date === UNSCHEDULED_DATE_KEY
        ? 'Unscheduled'
        : new Date(`${group.date}T00:00:00`).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: '2-digit',
          }),
    eventCount: group.timelines.length,
  }));
}

/**
 * Strips Vietnamese (and other Latin) diacritics for accent-insensitive comparison.
 * Uses NFD decomposition then removes combining marks.
 *
 * Example: "Lễ khai kinh" → "le khai kinh"
 */
function removeDiacritics(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeForSearch(text?: string | null): string {
  if (!text) return '';
  return removeDiacritics(text.trim().toLowerCase());
}

/**
 * Lightweight search filter for event map points.
 * Searches across timeline name, point name, general name, description, and address.
 * Supports Vietnamese diacritics-insensitive matching
 * (e.g. searching "le khai" will match "Lễ khai kinh").
 */
export function filterEventMapPointsBySearch(points: EventMapPoint[], query: string): EventMapPoint[] {
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedQuery) {
    return [];
  }

  return points.filter((point) => {
    const fields = [
      point.timelineName,
      point.pointName,
      point.name,
      point.description,
      point.timelineDescription,
      point.address,
    ];

    return fields.some((field) => normalizeForSearch(field).includes(normalizedQuery));
  });
}
