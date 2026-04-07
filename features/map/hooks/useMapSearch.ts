import { useCallback, useMemo, useState } from 'react';
import type { MapPoint } from '../types';

const normalizeText = (value: string) => value.trim().toLowerCase();

export function useMapSearch(mapPoints: MapPoint[]) {
  const [searchText, setSearchText] = useState('');

  const normalizedQuery = useMemo(() => normalizeText(searchText), [searchText]);
  const isSearching = normalizedQuery.length > 0;

  const filteredResults = useMemo(() => {
    if (!isSearching) {
      return [];
    }

    return mapPoints.filter((point) => {
      if (point.latitude === -1 || point.longitude === -1) {
        return false;
      }

      const name = normalizeText(point.name);
      const description = normalizeText(point.description ?? '');

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
