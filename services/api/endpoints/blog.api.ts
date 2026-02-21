export const blogEndpoints = {
  getBlogs: () => `blogs`,
  getBlogById: (id: string | number) => `blogs/${id}`,
} as const;
