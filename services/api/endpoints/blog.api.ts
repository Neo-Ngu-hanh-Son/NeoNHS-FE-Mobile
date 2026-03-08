export const blogEndpoints = {
  getBlogs: () => `blogs`,
  getBlogById: (id: string | number) => `blogs/${id}`,
  incrementView: (id: string | number) => `blogs/${id}/view`,
} as const;
