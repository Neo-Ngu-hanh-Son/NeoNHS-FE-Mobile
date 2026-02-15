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
  /** GET /api/events/{id}/ticket-catalogs — Ticket catalogs for an event */
  getTicketCatalogs: (eventId: string) => `events/${eventId}/ticket-catalogs`,
} as const;
