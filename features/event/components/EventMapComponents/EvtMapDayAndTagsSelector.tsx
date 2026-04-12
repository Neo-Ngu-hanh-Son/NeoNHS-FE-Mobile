import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import EventTimelineDaySelector from '../EventTimelineDaySelector';
import EventTimelineTagChips from '../EventTimelineTagChips';
import { EventTimelineDayOption, EventTimelineTagOption } from '../../hooks/useEventTimelineMapController';

type Props = {
  topInset: number;
  dayOptions: EventTimelineDayOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  tagOptions: EventTimelineTagOption[];
  activeTagId: string;
  onSelectTag: (tagId: string) => void;
  hasDays: boolean;
  hasTags: boolean;
};

export default function EvtMapDayAndTagsSelector({
  topInset,
  dayOptions,
  selectedDate,
  onSelectDate,
  tagOptions,
  activeTagId,
  onSelectTag,
  hasDays,
  hasTags,
}: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.panel,
        {
          top: topInset + 62,
          backgroundColor: isDarkColorScheme ? 'rgba(17,19,28,0.9)' : 'rgba(255,255,255,0.95)',
          borderColor: isDarkColorScheme ? `${theme.primary}` : `${theme.primary}`,
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
          style={[styles.divider, { backgroundColor: isDarkColorScheme ? `${theme.primary}` : `${theme.primary}` }]}
        />
      )}

      {/* Tag chips row */}
      {hasTags && (
        <View style={styles.sectionRow}>
          <EventTimelineTagChips options={tagOptions} activeTagId={activeTagId} onSelectTag={onSelectTag} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 40,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  accentStripe: {
    height: 2,
    width: '100%',
  },
  sectionRow: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    marginHorizontal: 8,
  },
});
