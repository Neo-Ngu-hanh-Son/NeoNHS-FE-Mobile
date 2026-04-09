import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EventMapPoint } from '@/features/map';
import type { EventPointTagResponse, EventTimelineGroupResponse } from '../types';
import {
  buildEventMapPointsFromGroups,
  buildEventTimelineDayOptions,
  deriveEventPointTagsFromGroups,
  filterEventMapPointsBySearch,
} from '../utils/helpers';

const ALL_TAG_ID = 'ALL';
const SEARCH_DEBOUNCE_MS = 200;

export type EventTimelineDayOption = {
  date: string;
  label: string;
  eventCount: number;
};

export type EventTimelineTagOption = {
  id: string;
  name: string;
};

interface UseEventTimelineMapControllerProps {
  groupedTimelines: EventTimelineGroupResponse[];
  pointTags?: EventPointTagResponse[];
  initialSelectedDate?: string;
  isMapReady?: boolean;
  onFitVisiblePoints?: (points: EventMapPoint[]) => void;
}

export function useEventTimelineMapController({
  groupedTimelines,
  pointTags = [],
  initialSelectedDate,
  isMapReady = false,
  onFitVisiblePoints,
}: UseEventTimelineMapControllerProps) {
  const dayOptions = useMemo<EventTimelineDayOption[]>(
    () => buildEventTimelineDayOptions(groupedTimelines),
    [groupedTimelines]
  );

  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate ?? dayOptions[0]?.date ?? '');
  const [activeTagId, setActiveTagId] = useState<string>(ALL_TAG_ID);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  useEffect(() => {
    const nextDate = initialSelectedDate ?? dayOptions[0]?.date ?? '';

    if (!selectedDate && nextDate) {
      setSelectedDate(nextDate);
      return;
    }

    if (selectedDate && dayOptions.some((option) => option.date === selectedDate)) {
      return;
    }

    if (nextDate !== selectedDate) {
      setSelectedDate(nextDate);
    }
  }, [dayOptions, initialSelectedDate, selectedDate]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText]);

  const activeGroup = useMemo(() => {
    if (!selectedDate) {
      return groupedTimelines[0] ?? null;
    }

    return groupedTimelines.find((group) => group.date === selectedDate) ?? groupedTimelines[0] ?? null;
  }, [groupedTimelines, selectedDate]);

  const dayPoints = useMemo(() => {
    if (!activeGroup) {
      return [] as EventMapPoint[];
    }

    return buildEventMapPointsFromGroups([activeGroup]);
  }, [activeGroup]);

  const resolvedTags = useMemo(() => {
    if (pointTags.length > 0) {
      return pointTags;
    }

    return deriveEventPointTagsFromGroups(groupedTimelines);
  }, [groupedTimelines, pointTags]);

  const tagOptions = useMemo<EventTimelineTagOption[]>(() => {
    const mapped = resolvedTags
      .map((tag) => ({
        id: tag.id,
        name: tag.name,
      }))
      .filter((tag) => tag.id && tag.name);

    return [{ id: ALL_TAG_ID, name: 'All' }, ...mapped];
  }, [resolvedTags]);

  useEffect(() => {
    if (activeTagId === ALL_TAG_ID) {
      return;
    }

    if (tagOptions.some((tag) => tag.id === activeTagId)) {
      return;
    }

    setActiveTagId(ALL_TAG_ID);
  }, [activeTagId, tagOptions]);

  const visiblePoints = useMemo(() => {
    if (activeTagId === ALL_TAG_ID) {
      return dayPoints;
    }

    return dayPoints.filter((point) => point.eventPointTag?.id === activeTagId);
  }, [activeTagId, dayPoints]);

  const isSearching = debouncedSearchText.length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) {
      return [] as EventMapPoint[];
    }

    return filterEventMapPointsBySearch(visiblePoints, debouncedSearchText);
  }, [debouncedSearchText, isSearching, visiblePoints]);

  const clearSearch = useCallback(() => {
    setSearchText('');
    setDebouncedSearchText('');
  }, []);

  const hasAutoFittedRef = useRef(false);
  useEffect(() => {
    if (!onFitVisiblePoints || !isMapReady) {
      return;
    }

    if (searchText.trim().length > 0) {
      return;
    }

    if (visiblePoints.length === 0) {
      return;
    }

    if (!hasAutoFittedRef.current) {
      onFitVisiblePoints(visiblePoints);
      hasAutoFittedRef.current = true;
      return;
    }

    const timeoutId = setTimeout(() => {
      onFitVisiblePoints(visiblePoints);
    }, 120);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isMapReady, onFitVisiblePoints, searchText, selectedDate, activeTagId, visiblePoints]);

  return {
    allTagId: ALL_TAG_ID,
    selectedDate,
    setSelectedDate,
    dayOptions,
    activeTagId,
    setActiveTagId,
    tagOptions,
    searchText,
    setSearchText,
    debouncedSearchText,
    clearSearch,
    isSearching,
    visiblePoints,
    searchResults,
  };
}
