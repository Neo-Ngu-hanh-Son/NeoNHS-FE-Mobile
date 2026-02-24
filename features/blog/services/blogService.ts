import { apiClient, endpoints } from '@/services/api';
import type { ApiResponse } from '@/services/api/types';
import type { BlogResponse, BlogPageResponse, BlogListParams } from '../types';

export const blogService = {
  getBlogs: async (params: BlogListParams = {}): Promise<BlogPageResponse> => {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.size !== undefined) queryParams.size = params.size;
    if (params.search) queryParams.search = params.search;
    if (params.status) queryParams.status = params.status;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDir) queryParams.sortDir = params.sortDir;
    if (params.tags?.length) {
      queryParams.tags = params.tags.join(',');
    }
    if (params.categorySlug) queryParams.categorySlug = params.categorySlug;
    if (params.isFeatured !== undefined) queryParams.isFeatured = params.isFeatured;

    const response = await apiClient.get<BlogPageResponse>(endpoints.blog.getBlogs(), {
      requiresAuth: false,
      params: queryParams,
    });

    return response.data;
  },

  /** Fetch a single blog post by ID */
  getBlogById: async (id: string | number): Promise<ApiResponse<BlogResponse>> => {
    return await apiClient.get<BlogResponse>(endpoints.blog.getBlogById(id), {
      requiresAuth: false,
    });
  },
};
