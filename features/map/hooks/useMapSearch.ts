import { useCallback, useMemo, useState } from 'react';
import type { MapPoint } from '../types';
import { normalizeString } from '@/utils/normalizeUtils';

export function useMapSearch<TPoint extends MapPoint>(mapPoints: TPoint[]) {
  const [searchText, setSearchText] = useState('');

  const normalizedQuery = useMemo(() => normalizeString(searchText), [searchText]);
  const isSearching = normalizedQuery.length > 0;

  const filteredResults = useMemo(() => {
    if (!isSearching) {
      return [];
    }

    return mapPoints.filter((point) => {
      if (point.latitude === -1 || point.longitude === -1) {
        return false;
      }

      const name = normalizeString(point.name);
      const description = normalizeString(point.description ?? '');

      return name.includes(normalizedQuery) || description.includes(normalizedQuery);
    });
  }, [isSearching, mapPoints, normalizedQuery]);

  const clearSearch = useCallback(() => {
    setSearchText('');
  }, []);

  return {
    searchText,
    setSearchText,
    clearSearch,
    isSearching,
    filteredResults,
  };
}

export default useMapSearch;
