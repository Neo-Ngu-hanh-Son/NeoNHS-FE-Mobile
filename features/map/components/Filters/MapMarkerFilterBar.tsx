import React from 'react';
import { ScrollView, View } from 'react-native';
import MapMarkerFilterChip from './MapMarkerFilterChip';
import type { MapMarkerFilterKey, MapMarkerFilters } from '../../hooks/useMapMarkerFilters';

type MapMarkerFilterBarProps = {
  filters: MapMarkerFilters;
  onToggleShowAll: () => void;
  onToggleFilter: (key: MapMarkerFilterKey) => void;
  topInset?: number;
};

export default function MapMarkerFilterBar({
  filters,
  onToggleShowAll,
  onToggleFilter,
  topInset = 0,
}: MapMarkerFilterBarProps) {
  return (
    <View
      pointerEvents="box-none"
      className="absolute left-0 right-0 z-30"
      style={{ top: topInset + 8, backgroundColor: 'transparent' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: 'transparent' }}>
        <MapMarkerFilterChip label="Show all" icon="apps-outline" active={filters.showAll} onPress={onToggleShowAll} />
        <MapMarkerFilterChip
          label="Check-in"
          icon="camera-outline"
          active={!filters.showAll && filters.showCheckin}
          onPress={() => onToggleFilter('checkin')}
        />
        <MapMarkerFilterChip
          label="Workshops"
          icon="construct-outline"
          active={!filters.showAll && filters.showWorkshop}
          onPress={() => onToggleFilter('workshop')}
        />
        <MapMarkerFilterChip
          label="Events"
          icon="calendar-outline"
          active={!filters.showAll && filters.showEvent}
          onPress={() => onToggleFilter('event')}
        />
        <MapMarkerFilterChip
          label="Places"
          icon="location-outline"
          active={!filters.showAll && filters.showPlaces}
          onPress={() => onToggleFilter('places')}
        />
      </ScrollView>
    </View>
  );
}
