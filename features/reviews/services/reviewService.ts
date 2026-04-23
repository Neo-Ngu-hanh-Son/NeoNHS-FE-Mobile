/**
 * Review REST API
 *
 * Listing:
 *   GET /api/reviews/workshops/{workshopTemplateId}
 *   GET /api/reviews/events/{eventId}
 *   GET /api/reviews/points/{pointId}
 *
 * Mutations:
 *   POST /api/reviews  |  PUT /api/reviews/{id}
 */
import { apiClient, endpoints, ApiResponse } from '@/services/api';
import type {
  CreateReviewRequest,
  ReviewListParams,
  ReviewResponse,
  UpdateReviewRequest,
  GenericReviewResponseWrapper,
  ReviewPageResponse,
} from '../types';

function buildQueryParams(params?: ReviewListParams): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (!params) return q;
  if (params.page !== undefined) q.page = params.page;
  if (params.size !== undefined) q.size = params.size;
  if (params.sortBy) q.sortBy = params.sortBy;
  if (params.sortDir) q.sortDir = params.sortDir;
  q.reviewTypeFlg = params.reviewTypeFlg;
  q.reviewTypeId = params.reviewTypeId;
  return q;
}

export const reviewService = {
  getWorkshopReviews: async (
    workshopTemplateId: string,
    params?: ReviewListParams
  ): Promise<ApiResponse<ReviewPageResponse>> =>
    apiClient.get<ReviewPageResponse>(endpoints.reviews.getWorkshopReviews(workshopTemplateId), {
      params: buildQueryParams(params),
      requiresAuth: false,
    }),

  getEventReviews: async (eventId: string, params?: ReviewListParams): Promise<ApiResponse<ReviewPageResponse>> =>
    apiClient.get<ReviewPageResponse>(endpoints.reviews.getEventReviews(eventId), {
      params: buildQueryParams(params),
      requiresAuth: false,
    }),

  getGenericReviews: async (
    params?: ReviewListParams
  ): Promise<ApiResponse<GenericReviewResponseWrapper>> => {
    return await apiClient.get<GenericReviewResponseWrapper>(endpoints.reviews.getGenericReviews(), {
      params: buildQueryParams(params),
      requiresAuth: false,
    });
  },

  createReview: async (request: CreateReviewRequest): Promise<ApiResponse<ReviewResponse>> =>
    apiClient.post<ReviewResponse>(endpoints.reviews.createReview(), request, { requiresAuth: true }),

  updateReview: async (reviewId: string, request: UpdateReviewRequest): Promise<ApiResponse<ReviewResponse>> =>
    apiClient.put<ReviewResponse>(endpoints.reviews.updateReview(reviewId), request, { requiresAuth: true }),
};

export default reviewService;
