export type BlogStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type BlogCategoryStatus = 'ACTIVE' | 'ARCHIVED';

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: BlogCategoryStatus;
  postCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface BlogUser {
  id: string;
  fullname: string;
  avatarUrl?: string;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  contentJSON?: string;
  contentHTML?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  isFeatured: boolean;
  status: BlogStatus;
  publishedAt?: string;
  tags?: string;
  viewCount: number;
  blogCategory?: BlogCategory;
  user?: BlogUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface BlogListParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  tags?: string[];
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  categorySlug?: string;
  isFeatured?: boolean;
}

export interface BlogFilters {
  status?: string;
  tags: string[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
  isFeatured?: boolean;
}

export type BlogSortOption = {
  label: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
};

export const BLOG_DEFAULT_FILTERS: BlogFilters = {
  status: 'PUBLISHED',
  tags: [],
  sortBy: 'publishedAt',
  sortDir: 'desc',
};

export const BLOG_SORT_OPTIONS: BlogSortOption[] = [
  { label: 'Newest', sortBy: 'publishedAt', sortDir: 'desc' },
  { label: 'Oldest', sortBy: 'publishedAt', sortDir: 'asc' },
  { label: 'Most Viewed', sortBy: 'viewCount', sortDir: 'desc' },
];

export const BLOG_STATUS_OPTIONS: Array<{ label: string; value?: string }> = [
  // { label: 'All', value: undefined },
  { label: 'Published', value: 'PUBLISHED' },
  // { label: 'Draft', value: 'DRAFT' },
  // { label: 'Archived', value: 'ARCHIVED' },
];

export const BLOG_TAG_OPTIONS: string[] = [
  'travel',
  'culture',
  'guide',
  'event',
  'workshop',
  'food',
];

export type BlogResponse = Blog;
export type BlogPageResponse = PaginatedResponse<Blog>;
