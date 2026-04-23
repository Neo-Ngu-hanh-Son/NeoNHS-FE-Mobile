import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { EventMapPoint, TimelineRow } from '../types';
import TimelineItem from './TimelineItem';

export type EventTimelineListSheetRef = BottomSheetModal;

type Props = {
  points: EventMapPoint[];
  selectedDateLabel?: string;
  onFocusPoint?: (point: EventMapPoint) => void;
};


const EventTimelineListBottomSheet = forwardRef<EventTimelineListSheetRef, Props>(
  ({ points, selectedDateLabel, onFocusPoint }, ref) => {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;
    const { top } = useSafeAreaInsets();

    const rows = useMemo<TimelineRow[]>(() => {
      const result: TimelineRow[] = [];
      for (const point of points) {
        const timelines = point.timelineInfos ?? [];
        if (timelines.length === 0) {
          result.push({
            key: `point-${point.id}`,
            timeline: { timelineName: point.pointName ?? point.name },
            point,
          });
        } else {
          for (const tl of timelines) {
            result.push({ key: tl.timelineId ?? `${point.id}-${tl.timelineName}`, timeline: tl, point });
          }
        }
      }

      return result.sort((a, b) => {
        const timeA = a.timeline.timelineStartTime ?? '99:99';
        const timeB = b.timeline.timelineStartTime ?? '99:99';
        return timeA.localeCompare(timeB);
      });
    }, [points]);

    const handleFocus = useCallback((point: EventMapPoint) => {
      onFocusPoint?.(point);
      (ref as any)?.current?.dismiss();
    }, [onFocusPoint, ref]);

    const renderBackdrop = useCallback(
      (props: any) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.3} />,
      []
    );

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={['60%', '90%']}
        // enableDynamicSizing
        topInset={top}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.border, width: 40 }}
      >
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.foreground }]}>
            {selectedDateLabel || "Daily Schedule"}
          </Text>
          <Text style={[styles.headerCount, { color: theme.mutedForeground }]}>
            {rows.length} scheduled items
          </Text>
        </View>

        <BottomSheetFlatList
          data={rows}
          keyExtractor={(item: TimelineRow) => item.key}
          renderItem={({ item, index }: { item: TimelineRow, index: number }) => (
            <TimelineItem
              row={item}
              isLast={index === rows.length - 1}
              onFocus={handleFocus}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      </BottomSheetModal>
    );
  }
);

EventTimelineListBottomSheet.displayName = 'EventTimelineListBottomSheet';

export default EventTimelineListBottomSheet;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});