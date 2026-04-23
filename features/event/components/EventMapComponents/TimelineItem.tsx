import React, { useEffect } from 'react';
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { EventMapPointTimelineInfo } from '../../types';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { BriefcaseBusiness, CalendarDays, ChevronRight, Clock3, FileText, Users } from 'lucide-react-native';

function formatTimelineTime(start?: string, end?: string): string {
  if (!start && !end) {
    return 'Time TBD';
  }

  const format = (value?: string) => {
    if (!value) return '';
    const [hours, minutes] = value.split(':');
    if (!hours || !minutes) return value;
    return `${hours}:${minutes}`;
  };

  const startTime = format(start);
  const endTime = format(end);

  if (startTime && endTime) return `${startTime} - ${endTime}`;
  return startTime || endTime || 'Time TBD';
}

function formatTimelineDate(date?: string): string {
  if (!date || date === 'unscheduled') {
    return 'Unscheduled';
  }

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  // return parsed.toLocaleDateString('vi-VN', {
  //   weekday: 'short',
  //   day: '2-digit',
  //   month: '2-digit',
  //   year: 'numeric',
  // });

  // TODO: For now just return in English
  return parsed.toLocaleDateString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export const TimelineItem = ({
  item,
  isExpanded,
  onPress,
}: {
  item: EventMapPointTimelineInfo;
  isExpanded: boolean;
  onPress: (selectedId: string) => void;
}) => {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(isExpanded ? 90 : 0, { duration: 180 });
  }, [isExpanded, rotation]);

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });
  const AnimatedChevron = Animated.createAnimatedComponent(ChevronRight);
  const timelineTitle = item.timelineName?.trim() || 'Untitled timeline';
  const timelineTime = formatTimelineTime(item.timelineStartTime, item.timelineEndTime);
  const timelineDate = formatTimelineDate(item.timelineDate);
  const timelineLunarDate = item.timelineLunarDate?.trim() || item.groupLunarDate?.trim();
  const organizer = item.timelineOrganizer?.trim();
  const coOrganizer = item.timelineCoOrganizer?.trim();
  const description = item.timelineDescription?.trim();

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(80).mass(0.5).stiffness(200)}
      style={[
        styles.card,
        {
          borderColor: theme.border,
          backgroundColor: theme.card,
          shadowOpacity: isDarkColorScheme ? 0 : 0.08,
        },
      ]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(item.timelineId ? item.timelineId : '')}
        style={[
          styles.header,
          {
            backgroundColor: isExpanded
              ? isDarkColorScheme
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(15,23,42,0.03)'
              : theme.card,
          },
        ]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={2}>
            {timelineTitle}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.metaChip, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <Clock3 size={16} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.foreground }]}>{timelineTime}</Text>
            </View>

            <View style={[styles.metaChip, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <CalendarDays size={16} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.foreground }]} numberOfLines={1}>
                {timelineDate}
              </Text>
            </View>

            {timelineLunarDate ? (
              <View style={[styles.metaChip, styles.lunarChip]}>
                <Text style={styles.lunarText}>{timelineLunarDate}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <AnimatedChevron style={chevronStyle} size={20} color={isExpanded ? theme.foreground : theme.mutedForeground} />
      </TouchableOpacity>

      {isExpanded && (
        <Animated.View
          entering={FadeInUp.duration(300)}
          exiting={FadeOutUp.duration(200)}
          style={[styles.expandedContainer, { borderTopColor: theme.border }]}>
          {description ? (
            <View style={styles.detailBlock}>
              <View style={styles.detailLabelRow}>
                <FileText size={16} color={theme.primary} />
                <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>Description</Text>
              </View>
              <Text style={[styles.detailText, { color: theme.foreground }]}>{description}</Text>
            </View>
          ) : null}

          {organizer ? (
            <View style={styles.detailRow}>
              <View style={styles.detailRowHeader}>
                <BriefcaseBusiness size={16} color={theme.primary} />
                <Text style={[styles.detailRowLabel, { color: theme.mutedForeground }]}>Organizer:</Text>
              </View>
              <Text style={[styles.detailRowValue, { color: theme.foreground }]} numberOfLines={2}>
                {organizer}
              </Text>
            </View>
          ) : null}

          {coOrganizer ? (
            <View style={styles.detailRow}>
              <View style={styles.detailRowHeader}>
                <Users size={16} color={theme.primary} />
                <Text style={[styles.detailRowLabel, { color: theme.mutedForeground }]}>Co-Organizer:</Text>
              </View>
              <Text style={[styles.detailRowValue, { color: theme.foreground }]} numberOfLines={2}>
                {coOrganizer}
              </Text>
            </View>
          ) : null}

          {!description && !organizer && !coOrganizer ? (
            <Text style={[styles.emptyDetails, { color: theme.mutedForeground }]}>
              No additional timeline details provided.
            </Text>
          ) : null}
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lunarChip: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.34)',
  },
  lunarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#b45309',
  },
  compactInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
  expandedContainer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  detailBlock: {
    gap: 6,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },
  detailRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailRowLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailRowValue: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyDetails: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
