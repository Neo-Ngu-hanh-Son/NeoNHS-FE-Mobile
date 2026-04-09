/**
 * Event Types — Data models for Event APIs
 * Based on NeoNHS Backend API specification
 */

import { MapPoint } from '@/features/map/types';

// ── Enums ──────────────────────────────────────────────

export enum EventStatus {
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TicketCatalogStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SOLD_OUT = 'SOLD_OUT',
}

// ── Tag ────────────────────────────────────────────────

export interface TagResponse {
  id: string;
  name: string;
  description: string;
  tagColor: string;
  iconUrl: string;
}

// ── Event Image ────────────────────────────────────────

export interface EventImageResponse {
  id: string;
  imageUrl: string;
  isThumbnail: boolean;
  createdAt: string;
}

// ── Event ──────────────────────────────────────────────

export interface EventResponse {
  id: string;
  name: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  locationName?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isTicketRequired?: boolean | null;
  price?: number | null;
  maxParticipants?: number | null;
  currentEnrolled?: number | null;
  status: EventStatus;
  thumbnailUrl?: string | null;
  averageRating: number;
  totalRatings: number;
  createdAt: string;
  updatedAt?: string | null;
  tags: TagResponse[];
  /** Only present in detail view (GET /api/events/{id}) */
  images?: EventImageResponse[] | null;
}

// ── Timeline Map Models ───────────────────────────────

export interface EventPointTagResponse {
  id: string;
  name: string;
  description?: string | null;
  tagColor?: string | null;
  iconUrl?: string | null;
}

export interface EventPointResponse {
  id: string;
  name: string;
  description?: string | null;
  imageList?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  address?: string | null;
  eventPointTag?: EventPointTagResponse | null;
}

export interface EventTimelineResponse {
  id: string;
  name: string;
  description?: string | null;
  organizer?: string | null;
  coOrganizer?: string | null;
  date: string;
  lunarDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  eventPoint: EventPointResponse;
  eventId: string;
}

export interface EventTimelineGroupResponse {
  date: string;
  lunarDate?: string | null;
  dayLabel?: string | null;
  timelines: EventTimelineResponse[];
}

export type EventTimelinesGroupedResponse = EventTimelineGroupResponse[];

export interface EventMapPointTag {
  id?: string;
  name: string;
  description?: string | null;
  tagColor?: string | null;
  color?: string;
  iconUrl?: string | null;
}

export interface EventMapPoint extends MapPoint {
  id: string;
  name: string;
  description?: string;
  /** Raw imageList string from backend */
  imageList?: string;
  /** Parsed image URL array derived from imageList */
  pointImages?: string[];
  latitude: number;
  longitude: number;
  address?: string;
  eventId?: string;
  /** Physical point name (the location/venue name) */
  pointName?: string;
  pointDescription?: string;
  // ── Timeline fields ───────────────────────────
  timelineId?: string;
  timelineName?: string;
  timelineDescription?: string;
  timelineDate?: string;
  /** Lunar date from the timeline entry */
  timelineLunarDate?: string;
  /** Lunar date from the parent group (day-level) */
  groupLunarDate?: string;
  timelineStartTime?: string;
  timelineEndTime?: string;
  timelineOrganizer?: string;
  timelineCoOrganizer?: string;
  eventPointTag?: EventMapPointTag;
}

export type EventTimeLineResponse = EventTimelineResponse;

export interface EventTimelinesGroupedParams {
  date?: string;
  fromDate?: string;
  toDate?: string;
  tagId?: string;
  search?: string;
  timezone?: string;
}

// ── Ticket Catalog ─────────────────────────────────────

export interface TicketCatalogResponse {
  id: string;
  eventId?: string | null;
  name: string;
  description?: string | null;
  customerType?: string | null;
  price: number;
  originalPrice?: number | null;
  applyOnDays?: string | null;
  validFromDate?: string | null;
  validToDate?: string | null;
  totalQuota?: number | null;
  soldQuantity: number;
  remainingQuantity?: number | null;
  status: TicketCatalogStatus;
  createdAt: string;
  updatedAt?: string | null;
}

// ── Pagination (Spring Boot Page<T>) ───────────────────

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ── Filter Params ──────────────────────────────────────

export interface EventFilterParams {
  page?: number;
  size?: number;
  status?: EventStatus;
  name?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  tagIds?: string[];
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}
