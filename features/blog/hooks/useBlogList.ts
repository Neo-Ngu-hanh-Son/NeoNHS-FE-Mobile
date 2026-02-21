import { useCallback, useEffect, useRef, useState } from 'react';
import { blogService } from '@/features/blog/services/blogService';
import { logger } from '@/utils/logger';
import { BLOG_DEFAULT_FILTERS } from '@/features/blog/types';
import type { Blog, BlogFilters } from '@/features/blog/types';

interface UseBlogListOptions {
  size?: number;
  search?: string;
  filters?: BlogFilters;
}

interface UseBlogListReturn {
  blogs: Blog[];
  page: number;
  totalPages: number;
  loading: boolean;
  refreshing: boolean;
  fetchBlogs: () => Promise<void>;
  loadMore: () => void;
  refresh: () => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 10;

export function useBlogList(options: UseBlogListOptions = {}): UseBlogListReturn {
  const { size = DEFAULT_PAGE_SIZE, search, filters } = options;

  const normalizedSearch = search?.trim() || undefined;
  const activeFilters = filters ?? BLOG_DEFAULT_FILTERS;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isFetchingRef = useRef(false);

  const requestPage = useCallback(
    async ({
      targetPage,
      replace,
      isRefresh,
    }: {
      targetPage: number;
      replace: boolean;
      isRefresh: boolean;
    }) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const pageData = await blogService.getBlogs({
          page: targetPage,
          size,
          search: normalizedSearch,
          status: activeFilters.status,
          tags: activeFilters.tags,
          sortBy: activeFilters.sortBy,
          sortDir: activeFilters.sortDir,
        });

        const incomingBlogs: Blog[] = pageData.content.map(({ contentJSON: _contentJson, ...blog }) => blog);

        setBlogs((prevBlogs) => (replace ? incomingBlogs : [...prevBlogs, ...incomingBlogs]));
        setPage(pageData.number);
        setTotalPages(pageData.totalPages);
      } catch (error) {
        logger.error('[useBlogList] Failed to fetch blogs:', error);
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeFilters.sortBy, activeFilters.sortDir, activeFilters.status, activeFilters.tags, normalizedSearch, size],
  );

  const fetchBlogs = useCallback(async () => {
    await requestPage({
      targetPage: 0,
      replace: true,
      isRefresh: false,
    });
  }, [requestPage]);

  const loadMore = useCallback(() => {
    if (loading || refreshing || isFetchingRef.current) {
      return;
    }

    if (totalPages === 0 || page + 1 >= totalPages) {
      return;
    }

    void requestPage({
      targetPage: page + 1,
      replace: false,
      isRefresh: false,
    });
  }, [loading, page, refreshing, requestPage, totalPages]);

  const refresh = useCallback(async () => {
    await requestPage({
      targetPage: 0,
      replace: true,
      isRefresh: true,
    });
  }, [requestPage]);

  useEffect(() => {
    setBlogs([]);
    setPage(0);
    void fetchBlogs();
  }, [fetchBlogs, normalizedSearch, activeFilters]);

  return {
    blogs,
    page,
    totalPages,
    loading,
    refreshing,
    fetchBlogs,
    loadMore,
    refresh,
  };
}
