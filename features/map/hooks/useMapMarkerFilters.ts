import { useCallback, useMemo, useState } from 'react';

export type MapMarkerFilterKey = 'checkin' | 'workshop' | 'event' | 'places';

export type MapMarkerFilters = {
  showAll: boolean;
  showCheckin: boolean;
  showWorkshop: boolean;
  showEvent: boolean;
  showPlaces: boolean;
};

const INITIAL_FILTERS: MapMarkerFilters = {
  showAll: true,
  showCheckin: false,
  showWorkshop: false,
  showEvent: false,
  showPlaces: false,
};

export function useMapMarkerFilters() {
  const [filters, setFilters] = useState<MapMarkerFilters>(INITIAL_FILTERS);

  const setShowAll = useCallback((enabled: boolean) => {
    if (enabled) {
      setFilters(INITIAL_FILTERS);
      return;
    }

    setFilters((prev) => ({
      ...prev,
      showAll: false,
    }));
  }, []);

  const toggleFilter = useCallback((key: MapMarkerFilterKey) => {
    setFilters((prev) => {
      const next = {
        ...prev,
        showAll: false,
        [
          key === 'checkin'
            ? 'showCheckin'
            : key === 'workshop'
              ? 'showWorkshop'
              : key === 'event'
                ? 'showEvent'
                : 'showPlaces'
        ]:
          !prev[
          key === 'checkin'
            ? 'showCheckin'
            : key === 'workshop'
              ? 'showWorkshop'
              : key === 'event'
                ? 'showEvent'
                : 'showPlaces'
          ],
      } as MapMarkerFilters;

      if (next.showCheckin && next.showWorkshop && next.showEvent && next.showPlaces) {
        return INITIAL_FILTERS;
      }

      return next;
    });
  }, []);

  const hasAnySpecificFilter = useMemo(() => {
    return filters.showCheckin || filters.showWorkshop || filters.showEvent || filters.showPlaces;
  }, [filters.showCheckin, filters.showWorkshop, filters.showEvent, filters.showPlaces]);

  return {
    filters,
    hasAnySpecificFilter,
    setShowAll,
    toggleFilter,
  };
}
