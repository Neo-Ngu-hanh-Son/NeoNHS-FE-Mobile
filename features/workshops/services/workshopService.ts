/**
 * Workshop Service
 * API methods for public workshop endpoints (Tourist)
 */
import { apiClient, endpoints, ApiResponse } from '@/services/api';
import {
  WorkshopTemplateResponse,
  WorkshopSessionResponse,
  WorkshopTagResponse,
  WorkshopPageResponse,
  WorkshopFilterParams,
  WorkshopSearchParams,
} from '../types';

export const workshopService = {
  /**
   * Get all workshop tags
   * GET /api/wtags/all
   */
  getAllTags: async (): Promise<ApiResponse<WorkshopTagResponse[]>> => {
    return await apiClient.get<WorkshopTagResponse[]>(
      endpoints.workshops.getAllTags(),
      { requiresAuth: false }
    );
  },

  /**
   * Get paginated list of active workshop templates
   * GET /api/public/workshops/templates
   */
  getTemplates: async (
    params?: WorkshopFilterParams
  ): Promise<ApiResponse<WorkshopPageResponse<WorkshopTemplateResponse>>> => {
    const queryParams: Record<string, string | number> = {};
    if (params) {
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.size !== undefined) queryParams.size = params.size;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortDir) queryParams.sortDir = params.sortDir;
    }
    return await apiClient.get<WorkshopPageResponse<WorkshopTemplateResponse>>(
      endpoints.workshops.getTemplates(),
      { params: queryParams, requiresAuth: false }
    );
  },

  /**
   * Get workshop template detail by ID
   * GET /api/public/workshops/templates/{id}
   */
  getTemplateById: async (
    id: string | number
  ): Promise<ApiResponse<WorkshopTemplateResponse>> => {
    return await apiClient.get<WorkshopTemplateResponse>(
      endpoints.workshops.getTemplateById(id),
      { requiresAuth: false }
    );
  },

  /**
   * Search & filter active workshop templates
   * GET /api/public/workshops/templates/search
   */
  searchTemplates: async (
    params?: WorkshopSearchParams
  ): Promise<ApiResponse<WorkshopPageResponse<WorkshopTemplateResponse>>> => {
    const queryParams: Record<string, string | number> = {};
    if (params) {
      if (params.keyword) queryParams.keyword = params.keyword;
      if (params.tagId) queryParams.tagId = params.tagId;
      if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
      if (params.minDuration !== undefined) queryParams.minDuration = params.minDuration;
      if (params.maxDuration !== undefined) queryParams.maxDuration = params.maxDuration;
      if (params.minRating !== undefined) queryParams.minRating = params.minRating;
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.size !== undefined) queryParams.size = params.size;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortDir) queryParams.sortDir = params.sortDir;
    }
    return await apiClient.get<WorkshopPageResponse<WorkshopTemplateResponse>>(
      endpoints.workshops.searchTemplates(),
      { params: queryParams, requiresAuth: false }
    );
  },

  /**
   * Get upcoming sessions for a workshop template
   * GET /api/public/workshops/templates/{id}/sessions
   */
  getSessions: async (
    templateId: string | number,
    params?: WorkshopFilterParams
  ): Promise<ApiResponse<WorkshopPageResponse<WorkshopSessionResponse>>> => {
    const queryParams: Record<string, string | number> = {};
    if (params) {
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.size !== undefined) queryParams.size = params.size;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortDir) queryParams.sortDir = params.sortDir;
    }
    return await apiClient.get<WorkshopPageResponse<WorkshopSessionResponse>>(
      endpoints.workshops.getTemplateSessions(templateId),
      { params: queryParams, requiresAuth: false }
    );
  },
};

export default workshopService;
