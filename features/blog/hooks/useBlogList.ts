import { useCallback, useEffect, useRef, useState } from 'react';
import { blogService } from '@/features/blog/services/blogService';
import { logger } from '@/utils/logger';
import { BLOG_DEFAULT_FILTERS } from '@/features/blog/types';
import type { Blog, BlogFilters } from '@/features/blog/types';

interface UseBlogListOptions {
  size?: number;
  search?: string;
  filters?: BlogFilters;
  autoFetch?: boolean;
}

interface UseBlogListReturn {
  blogs: Blog[];
  page: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetchBlogs: () => Promise<void>;
  loadMore: () => void;
  refresh: () => Promise<void>;
  fetchFeaturedBlog: () => Promise<void>;
}

const DEFAULT_PAGE_SIZE = 10;

export function useBlogList(options: UseBlogListOptions = {}): UseBlogListReturn {
  const { size = DEFAULT_PAGE_SIZE, search, filters, autoFetch = false } = options;

  const normalizedSearch = search?.trim() || undefined;
  const activeFilters = filters ?? BLOG_DEFAULT_FILTERS;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  const requestPage = useCallback(
    async ({ targetPage, replace }: { targetPage: number; replace: boolean }) => {
      if (isFetchingRef.current) {
        return;
      }

      isFetchingRef.current = true;

      setLoading(true);
      setError(null);
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

        const content = Array.isArray(pageData?.content)
          ? pageData.content
          : [];

        const incomingBlogs = content.map(
          ({ contentJSON: _contentJson, ...blog }) => blog
        );

        setBlogs((prevBlogs) => (replace ? incomingBlogs : [...prevBlogs, ...incomingBlogs]));
        setPage(pageData.number);
        setTotalPages(pageData.totalPages);
      } catch (error) {
        logger.error('[useBlogList] Failed to fetch blogs:', error);
        setError('Failed to fetch latest blogs.');
      } finally {
        isFetchingRef.current = false;
        setLoading(false);
      }
    },
    [
      activeFilters.sortBy,
      activeFilters.sortDir,
      activeFilters.status,
      activeFilters.tags,
      normalizedSearch,
      size,
    ]
  );

  const fetchBlogs = useCallback(async () => {
    await requestPage({
      targetPage: 0,
      replace: true,
    });
  }, [requestPage]);

  useEffect(() => {
    if (autoFetch) {
      void fetchBlogs();
    }
  }, [autoFetch, fetchBlogs]);

  const loadMore = useCallback(() => {
    if (loading || isFetchingRef.current) {
      return;
    }

    if (totalPages === 0 || page + 1 >= totalPages) {
      return;
    }

    void requestPage({
      targetPage: page + 1,
      replace: false,
    });
  }, [loading, page, requestPage, totalPages]);

  const refresh = useCallback(async () => {
    await requestPage({
      targetPage: 0,
      replace: true,
    });
  }, [requestPage]);

  const fetchFeaturedBlog = async () => {
    setLoading(true);
    try {
      const featuredBlogs = await blogService.getBlogs({
        page: 0,
        size: 1,
        search: normalizedSearch,
        status: activeFilters.status,
        tags: activeFilters.tags,
        sortBy: 'featured',
        sortDir: 'desc',
      });
      setBlogs(featuredBlogs.content);
    } catch (error) {
      throw new Error('Failed to fetch featured blog');
    } finally {
      setLoading(false);
    }
  };

  return {
    blogs,
    page,
    totalPages,
    loading,
    error,
    fetchBlogs,
    loadMore,
    refresh,
    fetchFeaturedBlog,
  };
}
