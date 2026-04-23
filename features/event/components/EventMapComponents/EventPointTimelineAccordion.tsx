import React, { useCallback, useMemo, useState } from 'react';
import { ListRenderItemInfo, View } from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { EventMapPoint, EventMapPointTimelineInfo } from '../../types';
import { TimelineItem } from './TimelineItem';

export function EventTimelineAccordion({ point }: { point: EventMapPoint }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const timelines = useMemo(() => point.timelineInfos ?? [], [point.timelineInfos]);

  const keyExtractor = useCallback(
    (item: EventMapPointTimelineInfo, index: number) => item.timelineId ?? `timeline-${point.id}-${index}`,
    [point.id]
  );

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<EventMapPointTimelineInfo>) => {
      const timelineKey = item.timelineId ?? `timeline-${point.id}-${index}`;
      const isExpanded = expandedId === timelineKey;

      return (
        <TimelineItem
          item={item}
          isExpanded={isExpanded}
          onPress={(selectedId) => {
            const nextId = selectedId || timelineKey;
            setExpandedId(isExpanded ? null : nextId);
          }}
        />
      );
    },
    [expandedId, point.id]
  );

  if (!timelines.length) {
    return (
      <View className="rounded-2xl border border-border bg-card p-4">
        <Text className="text-sm text-muted-foreground">No timeline events available for this point.</Text>
      </View>
    );
  }

  return (
    <BottomSheetFlatList
      data={timelines}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 8 }}
    />
  );
}
