/**
 * Review API & UI types — polymorphic entity (workshop / event / point)
 * @see REVIEW_UPDATE_GUIDE.md
 */

import { PageResponse } from '@/services/api';

/** 1: Workshop, 2: Event, 3: Point */
export const ReviewTypeFlg = {
  WORKSHOP: 'WORKSHOP',
  EVENT: 'EVENT',
  POINT: 'POINT',
} as const;

export type ReviewTypeFlgValue = (typeof ReviewTypeFlg)[keyof typeof ReviewTypeFlg];

export interface ReviewUser {
  id: string;
  fullname: string;
  email?: string;
  avatarUrl: string | null;
  role?: string;
}

export interface ReviewImageResponse {
  imageUrl: string;
  authorName?: string | null;
  authorId?: string | null;
  takenDate?: string | null;
}

/** Single review from GET/POST/PUT */
export interface ReviewResponse {
  id: string;
  reviewTypeFlg: ReviewTypeFlgValue;
  reviewTypeId: string;
  user: ReviewUser;
  rating: number;
  comment: string | null;
  createdAt: string;
  imageUrls: string[];
  reviewImages?: ReviewImageResponse[];
}

export interface GenericReviewResponse extends ReviewResponse {
  reviewImages: ReviewImageResponse[];
}

export interface ReviewPageResponse {
  content: ReviewResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface GenericReviewResponseWrapper {
  reviews: PageResponse<GenericReviewResponse>;
  totalReviews: number;
  avgRating: number;
}

export interface CreateReviewRequest {
  reviewTypeFlg: ReviewTypeFlgValue;
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
  reviewTypeFlg: ReviewTypeFlgValue;
  reviewTypeId: string;
}

/** UI list row — same shape as API review */
export type Review = ReviewResponse;
