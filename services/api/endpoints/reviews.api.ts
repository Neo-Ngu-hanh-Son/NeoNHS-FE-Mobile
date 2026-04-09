/**
 * Review endpoints (Workshop / Event / Point)
 * @see features/reviews/review-api-update.md
 */
export const reviewEndpoints = {
  /** GET /api/reviews/workshops/{workshopTemplateId} */
  getWorkshopReviews: (workshopTemplateId: string) =>
    `reviews/workshops/${workshopTemplateId}`,
  /** GET /api/reviews/events/{eventId} */
  getEventReviews: (eventId: string) =>
    `reviews/events/${eventId}`,
  /** GET /api/reviews/points/{pointId} */
  getPointReviews: (pointId: string) =>
    `reviews/points/${pointId}`,
  /** POST /api/reviews */
  createReview: () => `reviews`,
  /** PUT /api/reviews/{id} */
  updateReview: (id: string) => `reviews/${id}`,
} as const;
