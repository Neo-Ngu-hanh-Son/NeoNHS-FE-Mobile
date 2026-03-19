/**
 * Workshop Public Endpoints (Tourist)
 * Base: /api/public/workshops
 */
export const workshopEndpoints = {
  /** GET /api/public/workshops/templates */
  getTemplates: () => `public/workshops/templates`,
  /** GET /api/public/workshops/templates/{id} */
  getTemplateById: (id: string | number) => `public/workshops/templates/${id}`,
  /** GET /api/public/workshops/templates/search */
  searchTemplates: () => `public/workshops/templates/search`,
  /** GET /api/public/workshops/templates/{id}/sessions */
  getTemplateSessions: (id: string | number) => `public/workshops/templates/${id}/sessions`,
  /** GET /api/wtags/all */
  getAllTags: () => `wtags/all`,

  // ── Reviews ──────────────────────────────────────────
  /** GET /api/reviews/workshops/{workshopTemplateId} */
  getReviews: (workshopTemplateId: string) =>
    `reviews/workshops/${workshopTemplateId}`,
  /** POST /api/reviews */
  createReview: () => `reviews`,
  /** PUT /api/reviews/{id} */
  updateReview: (id: string) => `reviews/${id}`,
} as const;
