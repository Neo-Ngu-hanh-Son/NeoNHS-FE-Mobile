/**
 * Event Service
 * API methods for events and ticket catalogs
 */
import { apiClient, endpoints, ApiResponse } from "@/services/api";
import {
  EventResponse,
  TicketCatalogResponse,
  PageResponse,
  EventFilterParams,
} from "../types/event.types";

export const eventService = {
  /**
   * Get paginated list of events
   * GET /api/events
   */
  getEvents: async (
    params?: EventFilterParams
  ): Promise<ApiResponse<PageResponse<EventResponse>>> => {
    // Build query params, filtering out undefined values
    const queryParams: Record<string, string | number | boolean> = {};
    if (params) {
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.size !== undefined) queryParams.size = params.size;
      if (params.status) queryParams.status = params.status;
      if (params.name) queryParams.name = params.name;
      if (params.location) queryParams.location = params.location;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortDir) queryParams.sortDir = params.sortDir;
      // tagIds is an array — join as comma-separated
      if (params.tagIds && params.tagIds.length > 0) {
        queryParams.tagIds = params.tagIds.join(",");
      }
    }
    return await apiClient.get<PageResponse<EventResponse>>(
      endpoints.events.getEvents(),
      { params: queryParams }
    );
  },

  /**
   * Get all events (no pagination)
   * GET /api/events/all
   */
  getAllEvents: async (): Promise<ApiResponse<EventResponse[]>> => {
    return await apiClient.get<EventResponse[]>(
      endpoints.events.getAllEvents()
    );
  },

  /**
   * Get event detail by ID
   * GET /api/events/{id}
   */
  getEventById: async (id: string): Promise<ApiResponse<EventResponse>> => {
    return await apiClient.get<EventResponse>(
      endpoints.events.getEventById(id)
    );
  },

  /**
   * Get ticket catalogs for an event
   * GET /api/events/{id}/ticket-catalogs
   */
  getTicketCatalogs: async (
    eventId: string
  ): Promise<ApiResponse<TicketCatalogResponse[]>> => {
    return await apiClient.get<TicketCatalogResponse[]>(
      endpoints.events.getTicketCatalogs(eventId)
    );
  },
};

export default eventService;
