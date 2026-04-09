/**
 * Review API & UI types — polymorphic entity (workshop / event / point)
 * @see REVIEW_UPDATE_GUIDE.md
 */

/** 1: Workshop, 2: Event, 3: Point */
export const  ReviewTypeFlg = {
  WORKSHOP: 1,
  EVENT: 2,
  POINT: 3,
} as const;

export type ReviewTypeFlgValue = (typeof ReviewTypeFlg)[keyof typeof ReviewTypeFlg];

export interface ReviewUser {
  id: string;
  fullname: string;
  email?: string;
  avatarUrl: string | null;
  role?: string;
}

/** Single review from GET/POST/PUT */
export interface ReviewResponse {
  id: string;
  reviewTypeFlg: number;
  reviewTypeId: string;
  user: ReviewUser;
  rating: number;
  comment: string | null;
  createdAt: string;
  imageUrls: string[];
}

/** Spring-style page wrapper returned by all review listing endpoints. */
export interface ReviewPageResponse {
  content: ReviewResponse[];
  page?: number;
  number?: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface CreateReviewRequest {
  reviewTypeFlg: number;
  reviewTypeId: string;
  rating: number;
  comment?: string;
  imageUrls?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  imageUrls?: string[];
}

export type ReviewSortBy = 'createdAt' | 'updatedAt' | 'rating';
export type ReviewSortDir = 'asc' | 'desc';

export interface ReviewListParams {
  page?: number;
  size?: number;
  sortBy?: ReviewSortBy;
  sortDir?: ReviewSortDir;
}

/** UI list row — same shape as API review */
export type Review = ReviewResponse;
