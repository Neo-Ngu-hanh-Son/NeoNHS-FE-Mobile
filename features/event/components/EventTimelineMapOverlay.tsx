import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { MapSearchBar } from '@/features/map';
import EventTimelineDaySelector from './EventTimelineDaySelector';
import EventTimelineTagChips from './EventTimelineTagChips';
import type { EventTimelineDayOption, EventTimelineTagOption } from '../hooks/useEventTimelineMapController';
import type { EventMapPoint } from '../types';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';

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

  /** Custom search result row for event timeline: tag icon · timeline name · address */
  const renderSearchResult = useCallback(
    (item: EventMapPoint, onSelect: (point: EventMapPoint) => void) => {
      const tagColor = item.eventPointTag?.tagColor ?? item.eventPointTag?.color ?? theme.primary;
      const tagIconUrl = item.eventPointTag?.iconUrl;
      const name = item.timelineName ?? item.name;
      const address = item.address;

      return (
        <Pressable
          onPress={() => onSelect(item)}
          style={resultStyles.row}
          android_ripple={{ color: isDarkColorScheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
          {/* Tag icon */}
          <View style={[resultStyles.iconWrap, { backgroundColor: `${tagColor}20`, borderColor: `${tagColor}50` }]}>
            {tagIconUrl ? (
              <Image source={{ uri: tagIconUrl }} style={resultStyles.tagIcon} contentFit="cover" />
            ) : (
              <Ionicons name="location" size={16} color={tagColor} />
            )}
          </View>

          {/* Name + address */}
          <View style={resultStyles.textWrap}>
            <Text style={[resultStyles.nameText, { color: theme.foreground }]} numberOfLines={1}>
              {name}
            </Text>
            {address ? (
              <Text style={[resultStyles.addressText, { color: theme.mutedForeground }]} numberOfLines={1}>
                {address}
              </Text>
            ) : null}
          </View>
        </Pressable>
      );
    },
    [isDarkColorScheme, theme.foreground, theme.mutedForeground, theme.primary]
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

      {/* ── Day + Tag panel ────────────────────── */}
      {(hasDays || hasTags) && (
        <View
          pointerEvents="box-none"
          style={[
            styles.panel,
            {
              top: topInset + 66,
              backgroundColor: isDarkColorScheme ? 'rgba(17,19,28,0.88)' : 'rgba(255,255,255,0.9)',
              borderColor: isDarkColorScheme ? `${theme.primary}40` : `${theme.primary}28`,
              shadowColor: theme.primary,
            },
          ]}>
          {/* Brand accent stripe */}
          <View style={[styles.accentStripe, { backgroundColor: theme.primary }]} />

          {/* Day selector row */}
          {hasDays && (
            <View style={styles.sectionRow}>
              <EventTimelineDaySelector options={dayOptions} selectedDate={selectedDate} onSelectDate={onSelectDate} />
            </View>
          )}

          {/* Divider between day and tags */}
          {hasDays && hasTags && (
            <View
              style={[
                styles.divider,
                { backgroundColor: isDarkColorScheme ? `${theme.primary}30` : `${theme.primary}20` },
              ]}
            />
          )}

          {/* Tag chips row */}
          {hasTags && (
            <View style={styles.sectionRow}>
              <EventTimelineTagChips options={tagOptions} activeTagId={activeTagId} onSelectTag={onSelectTag} />
            </View>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 40,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  accentStripe: {
    height: 3,
    width: '100%',
  },
  sectionRow: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    marginHorizontal: 12,
  },
});

const resultStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  tagIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  textWrap: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 11,
  },
});
