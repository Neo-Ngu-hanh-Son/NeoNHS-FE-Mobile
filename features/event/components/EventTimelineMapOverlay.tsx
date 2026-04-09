import React from 'react';
import { View } from 'react-native';
import { MapSearchBar, EventMapPoint } from '@/features/map';
import EventTimelineDaySelector from './EventTimelineDaySelector';
import EventTimelineTagChips from './EventTimelineTagChips';
import type { EventTimelineDayOption, EventTimelineTagOption } from '../hooks/useEventTimelineMapController';

type EventTimelineMapOverlayProps = {
  topInset: number;
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
  return (
    <>
      <MapSearchBar<EventMapPoint>
        value={searchValue}
        onChangeText={onSearchChange}
        onClear={onClearSearch}
        onSelectResult={onSelectSearchResult}
        results={searchResults}
        isSearching={isSearching}
        topInset={topInset}
      />

      <View pointerEvents="box-none" className="absolute left-0 right-0 z-40 px-4" style={{ top: topInset + 66 }}>
        <EventTimelineDaySelector options={dayOptions} selectedDate={selectedDate} onSelectDate={onSelectDate} />
        <View className="mt-2">
          <EventTimelineTagChips options={tagOptions} activeTagId={activeTagId} onSelectTag={onSelectTag} />
        </View>
      </View>
    </>
  );
}
