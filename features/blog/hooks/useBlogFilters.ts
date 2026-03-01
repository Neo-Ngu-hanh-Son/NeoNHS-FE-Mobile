import { useCallback, useMemo, useState } from 'react';
import type { BlogFilters } from '@/features/blog/types';
import { BLOG_DEFAULT_FILTERS } from '@/features/blog/types';

interface UseBlogFiltersReturn {
  currentFilters: BlogFilters;
  setStatus: (status?: string) => void;
  toggleTag: (tag: string) => void;
  setSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  resetFilters: () => void;
  setFilters: (filters: BlogFilters) => void;
}

export function useBlogFilters(initialFilters: BlogFilters = BLOG_DEFAULT_FILTERS): UseBlogFiltersReturn {
  const [status, setStatusState] = useState<string | undefined>(initialFilters.status);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialFilters.tags);
  const [sortBy, setSortBy] = useState<string>(initialFilters.sortBy);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialFilters.sortDir);

  const setStatus = useCallback((nextStatus?: string) => {
    setStatusState(nextStatus);
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prevTags) => {
      if (prevTags.includes(tag)) {
        return prevTags.filter((value) => value !== tag);
      }
      return [...prevTags, tag];
    });
  }, []);

  const setSort = useCallback((nextSortBy: string, nextSortDir: 'asc' | 'desc') => {
    setSortBy(nextSortBy);
    setSortDir(nextSortDir);
  }, []);

  const resetFilters = useCallback(() => {
    setStatusState(BLOG_DEFAULT_FILTERS.status);
    setSelectedTags(BLOG_DEFAULT_FILTERS.tags);
    setSortBy(BLOG_DEFAULT_FILTERS.sortBy);
    setSortDir(BLOG_DEFAULT_FILTERS.sortDir);
  }, []);

  const setFilters = useCallback((filters: BlogFilters) => {
    setStatusState(filters.status);
    setSelectedTags(filters.tags);
    setSortBy(filters.sortBy);
    setSortDir(filters.sortDir);
  }, []);

  const currentFilters = useMemo(
    () => ({
      status,
      tags: selectedTags,
      sortBy,
      sortDir,
    }),
    [selectedTags, sortBy, sortDir, status],
  );

  return {
    currentFilters,
    setStatus,
    toggleTag,
    setSort,
    resetFilters,
    setFilters,
  };
}
