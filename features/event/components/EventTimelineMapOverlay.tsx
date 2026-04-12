import React, { useCallback } from 'react';
import { MapSearchBar } from '@/features/map';
import type { EventTimelineDayOption, EventTimelineTagOption } from '../hooks/useEventTimelineMapController';
import type { EventMapPoint } from '../types';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import EvtMapSearchResultComponent from './EventMapComponents/EvtMapSearchResultComponent';
import EvtMapDayAndTagsSelector from './EventMapComponents/EvtMapDayAndTagsSelector';

// Back button: left:16 + icon size ~40 + gap 8 = 64
const BACK_BUTTON_OFFSET = 64;

type EventTimelineMapOverlayProps = {
  topInset: number;
  showBackButton?: boolean;
  searchValue: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onSelectSearchResult: (point: EventMapPoint) => void;
  searchResults: EventMapPoint[];
  isSearching: boolean;
  dayOptions: EventTimelineDayOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  tagOptions: EventTimelineTagOption[];
  activeTagId: string;
  onSelectTag: (tagId: string) => void;
};

export default function EventTimelineMapOverlay({
  topInset,
  showBackButton = false,
  searchValue,
  onSearchChange,
  onClearSearch,
  onSelectSearchResult,
  searchResults,
  isSearching,
  dayOptions,
  selectedDate,
  onSelectDate,
  tagOptions,
  activeTagId,
  onSelectTag,
}: EventTimelineMapOverlayProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const searchLeftOffset = showBackButton ? BACK_BUTTON_OFFSET : 0;
  const hasTags = tagOptions.length > 0;
  const hasDays = dayOptions.length > 0;

  /** Search result row: location name + timeline count + address */
  const renderSearchResult = useCallback(
    (item: EventMapPoint, onSelect: (point: EventMapPoint) => void) => {
      const tagColor = item.eventPointTag?.tagColor ?? item.eventPointTag?.color ?? theme.primary;
      const tagIconUrl = item.eventPointTag?.iconUrl;
      const name = item.pointName?.trim() || item.name;
      const address = item.address;
      const timelineCount = item.timelineInfos?.length ?? 0;
      const subtitle = timelineCount > 0 ? `${timelineCount} ${timelineCount === 1 ? 'timeline' : 'timelines'}` : '';

      return (
        <EvtMapSearchResultComponent
          onSelect={onSelect}
          item={item}
          tagColor={tagColor}
          tagIconUrl={tagIconUrl}
          name={name}
          subtitle={subtitle}
          address={address}
        />
      );
    },
    [theme.primary]
  );

  return (
    <>
      {/* ── Search bar ─────────────────────────── */}
      <MapSearchBar<EventMapPoint>
        value={searchValue}
        onChangeText={onSearchChange}
        onClear={onClearSearch}
        onSelectResult={onSelectSearchResult}
        results={searchResults}
        isSearching={isSearching}
        topInset={topInset}
        leftOffset={searchLeftOffset}
        renderSearchResult={renderSearchResult}
      />

      {(hasDays || hasTags) && (
        <EvtMapDayAndTagsSelector
          topInset={topInset}
          dayOptions={dayOptions}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          tagOptions={tagOptions}
          activeTagId={activeTagId}
          onSelectTag={onSelectTag}
          hasDays={hasDays}
          hasTags={hasTags}
        />
      )}
    </>
  );
}
