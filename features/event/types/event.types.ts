/**
 * Event Types — Data models for Event APIs
 * Based on NeoNHS Backend API specification
 */

// ── Enums ──────────────────────────────────────────────

export enum EventStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum TicketCatalogStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SOLD_OUT = "SOLD_OUT",
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
  createdAt: string;
  updatedAt?: string | null;
  tags: TagResponse[];
  /** Only present in detail view (GET /api/events/{id}) */
  images?: EventImageResponse[] | null;
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
  sortDir?: "asc" | "desc";
}
