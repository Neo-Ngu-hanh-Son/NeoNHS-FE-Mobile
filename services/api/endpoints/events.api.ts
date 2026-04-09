/**
 * Event API Endpoints
 * Public APIs for viewing events and ticket catalogs
 */
export const eventEndpoints = {
  /** GET /api/events — Paginated list */
  getEvents: () => `events`,
  /** GET /api/events/all — Full list (no pagination) */
  getAllEvents: () => `events/all`,
  /** GET /api/events/{id} — Event detail */
  getEventById: (id: string) => `events/${id}`,
  /** GET /api/events/{id}/timelines/grouped — Grouped timeline for timeline map */
  getEventTimelinesGrouped: (eventId: string) => `events/${eventId}/timelines/grouped`,
  /** GET /api/events/{id}/point-tags — Point tag options for timeline map filters */
  getEventPointTags: (eventId: string) => `events/${eventId}/point-tags`,
  /** GET /api/events/{id}/ticket-catalogs — Ticket catalogs for an event */
  getTicketCatalogs: (eventId: string) => `events/${eventId}/ticket-catalogs`,
} as const;
