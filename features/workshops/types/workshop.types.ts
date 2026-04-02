/**
 * Workshop Types — Data models for Workshop Tourist APIs
 * Based on /api/public/workshops endpoints
 */

// ── Enums ──────────────────────────────────────────────

export enum WorkshopTemplateStatus {
  ACTIVE = "ACTIVE",
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  REJECTED = "REJECTED",
}

export enum WorkshopSessionStatus {
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// ── Workshop Image ─────────────────────────────────────

export interface WorkshopImageResponse {
  id: string;
  imageUrl: string;
  isThumbnail: boolean;
}

// ── Workshop Tag ───────────────────────────────────────

export interface WorkshopTagResponse {
  id: string;
  name: string;
  description?: string;
  tagColor: string;
  iconUrl?: string;
}

// ── Workshop Template ──────────────────────────────────

export interface WorkshopTemplateResponse {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  estimatedDuration: number;
  defaultPrice: number;
  minParticipants: number;
  maxParticipants: number;
  status: WorkshopTemplateStatus;
  isPublished: boolean;
  averageRating: number;
    totalRatings: number;
  vendorId: string;
  vendorName: string;
  createdAt: string;
  updatedAt: string;
  adminNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  images: WorkshopImageResponse[];
  tags: WorkshopTagResponse[];
}

// ── Workshop Session ───────────────────────────────────

export interface WorkshopSessionResponse {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  maxParticipants: number;
  currentEnrolled: number;
  availableSlots: number;
  status: WorkshopSessionStatus;
  workshopTemplateId: string;
  name: string;
  shortDescription: string;
  estimatedDuration: number;
  averageRating: number;
  totalRatings: number;
  vendorId: string;
  vendorName: string;
  images: WorkshopImageResponse[];
  tags: WorkshopTagResponse[];
  createdAt: string;
  updatedAt: string;
}

// ── Pagination (Spring Boot Page<T>) ───────────────────

export interface WorkshopPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
  first: boolean;
  last: boolean;
  pageable?: {
    pageNumber: number;
    pageSize: number;
  };
}

// ── Filter / Search Params ─────────────────────────────

export interface WorkshopFilterParams {
  page?: number;
  size?: number;
  sortBy?: "createdAt" | "name" | "defaultPrice" | "averageRating" | "estimatedDuration";
  sortDir?: "asc" | "desc";
}

export interface WorkshopSearchParams extends WorkshopFilterParams {
  keyword?: string;
  tagId?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
}

// ── Review Types ───────────────────────────────────────

export interface ReviewUserResponse {
  id: string;
  fullname: string;
  avatarUrl: string | null;
  role: string;
}

export interface WorkshopReviewResponse {
  id: string;
  workshopTemplateId: string;
  user: ReviewUserResponse;
  rating: number;
  comment: string;
  createdAt: string;
  imageUrls: string[];
}

/** Pagination wrapper returned by GET /api/reviews/workshops/{id}
 *  `page` is used in the API doc; Spring Boot's standard Page<T> uses `number`.
 *  Both fields are optional so we handle either shape defensively.
 */
export interface WorkshopReviewPageResponse {
  content: WorkshopReviewResponse[];
  page?: number;    // API-doc custom field
  number?: number;  // Spring Boot standard Page.number
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface CreateReviewRequest {
  workshopTemplateId: string;
  rating: number;
  comment?: string;
  imageUrls?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  imageUrls?: string[];
}

export interface WorkshopReviewParams {
  page?: number;
  size?: number;
  /** e.g. "createdAt,desc" | "rating,desc" | "rating,asc" */
  sort?: string;
}
