/**
 * Event Service
 * API methods for events and ticket catalogs
 */
import { apiClient, endpoints, ApiResponse } from '@/services/api';
import {
  EventResponse,
  EventTimelinesGroupedParams,
  EventTimelinesGroupedResponse,
  EventPointTagResponse,
  TicketCatalogResponse,
  PageResponse,
  EventFilterParams,
} from '../types/event.types';

export const eventService = {
  /**
   * Get paginated list of events
   * GET /api/events
   */
  getEvents: async (params?: EventFilterParams): Promise<ApiResponse<PageResponse<EventResponse>>> => {
    // Build query params, filtering out undefined values
    const queryParams: Record<string, string | number | boolean> = {};
    if (params) {
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.size !== undefined) queryParams.size = params.size;
      if (params.status) queryParams.status = params.status;
      if (params.name) queryParams.name = params.name;
      if (params.location) queryParams.location = params.location;
      if (params.startDate) queryParams.startTime = params.startDate;
      if (params.endDate) queryParams.endTime = params.endDate;
      if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortDir) queryParams.sortDir = params.sortDir;
      // tagIds is an array — join as comma-separated
      if (params.tagIds && params.tagIds.length > 0) {
        queryParams.tagIds = params.tagIds.join(',');
      }
    }
    return await apiClient.get<PageResponse<EventResponse>>(endpoints.events.getEvents(), {
      params: queryParams,
      requiresAuth: false,
    });
  },

  /**
   * Get all events (no pagination)
   * GET /api/events/all
   */
  getAllEvents: async (): Promise<ApiResponse<EventResponse[]>> => {
    return await apiClient.get<EventResponse[]>(endpoints.events.getAllEvents());
  },

  /**
   * Get event detail by ID
   * GET /api/events/{id}
   */
  getEventById: async (id: string): Promise<ApiResponse<EventResponse>> => {
    return await apiClient.get<EventResponse>(endpoints.events.getEventById(id));
  },

  /**
   * Get grouped event timeline for timeline map.
   * GET /api/events/{id}/timelines/grouped
   */
  getEventTimelinesGrouped: async (
    eventId: string,
    params?: EventTimelinesGroupedParams
  ): Promise<ApiResponse<EventTimelinesGroupedResponse | EventTimelinesGroupedResponse['groups']>> => {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params) {
      if (params.date) queryParams.date = params.date;
      if (params.fromDate) queryParams.fromDate = params.fromDate;
      if (params.toDate) queryParams.toDate = params.toDate;
      if (params.tagId) queryParams.tagId = params.tagId;
      if (params.search) queryParams.search = params.search;
      if (params.timezone) queryParams.timezone = params.timezone;
    }

    return await apiClient.get<EventTimelinesGroupedResponse | EventTimelinesGroupedResponse['groups']>(
      endpoints.events.getEventTimelinesGrouped(eventId),
      {
        params: queryParams,
        requiresAuth: false,
      }
    );
  },

  /**
   * Get point tags for event timeline map.
   * GET /api/events/{id}/point-tags
   */
  getEventPointTags: async (eventId: string): Promise<ApiResponse<EventPointTagResponse[]>> => {
    return await apiClient.get<EventPointTagResponse[]>(endpoints.events.getEventPointTags(eventId), {
      requiresAuth: false,
    });
  },

  /**
   * Get ticket catalogs for an event
   * GET /api/events/{id}/ticket-catalogs
   */
  getTicketCatalogs: async (eventId: string): Promise<ApiResponse<TicketCatalogResponse[]>> => {
    return await apiClient.get<TicketCatalogResponse[]>(endpoints.events.getTicketCatalogs(eventId));
  },
};

export default eventService;
