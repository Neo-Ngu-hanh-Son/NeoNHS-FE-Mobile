export const blogEndpoints = {
  getBlogs: () => `blogs`,
  getBlogsPreviews: () => `blogs/previews`,
  getBlogById: (id: string | number) => `blogs/${id}`,
  incrementView: (id: string | number) => `blogs/${id}/view`,
  getBlogCategories: () => `public/blogs/categories`,
} as const;
