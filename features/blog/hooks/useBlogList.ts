import { useCallback, useEffect, useRef, useState } from 'react';
import { blogService } from '@/features/blog/services/blogService';
import { logger } from '@/utils/logger';
import { BLOG_DEFAULT_FILTERS } from '@/features/blog/types';
import type { Blog, BlogFilters } from '@/features/blog/types';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { translationApi } from '@/services/api/translationApi';

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
  const { language } = useLanguage();

  const normalizedSearch = search?.trim() || undefined;
  const activeFilters = filters ?? BLOG_DEFAULT_FILTERS;

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  const translateBlogs = async (incomingBlogs: Blog[]): Promise<Blog[]> => {
    if (language === 'vi' || incomingBlogs.length === 0) return incomingBlogs;

    const fieldsToTranslate: Record<string, string> = {};
    incomingBlogs.forEach((blog) => {
      if (blog.title) fieldsToTranslate[`${blog.id}_title`] = blog.title;
      // You can add blog.shortDescription or similar fields here if needed
    });

    if (Object.keys(fieldsToTranslate).length > 0) {
      const translatedFields = await translationApi.translateBatch(fieldsToTranslate, language);
      return incomingBlogs.map((blog) => ({
        ...blog,
        title: translatedFields[`${blog.id}_title`] || blog.title,
      }));
    }
    return incomingBlogs;
  };

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

        let incomingBlogs = content.map(
          ({ contentJSON: _contentJson, ...blog }) => blog as Blog
        );

        incomingBlogs = await translateBlogs(incomingBlogs);

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
      language, // Added language dependency
    ]
  );

  const fetchBlogs = useCallback(async () => {
    await requestPage({
      targetPage: 0,
      replace: true,
    });
  }, [requestPage]);

  // Re-fetch when language changes (if autoFetch is enabled)
  useEffect(() => {
    if (autoFetch) {
      void fetchBlogs();
    }
  }, [autoFetch, fetchBlogs, language]);

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
      const pageData = await blogService.getBlogs({
        page: 0,
        size: 1,
        search: normalizedSearch,
        status: activeFilters.status,
        tags: activeFilters.tags,
        sortBy: 'featured',
        sortDir: 'desc',
      });
      const translated = await translateBlogs(pageData.content as Blog[]);
      setBlogs(translated);
    } catch (error) {
      logger.error('[useBlogList] Failed to fetch featured blog:', error);
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
