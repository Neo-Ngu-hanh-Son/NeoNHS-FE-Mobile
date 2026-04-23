import React from 'react'
import { EventMapPoint, TimelineRow } from '../types';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { formatSimpleTime, resolveColor } from '../utils/helpers';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { MapPin, Navigation } from 'lucide-react-native';


export default function TimelineItem({
  row,
  isLast,
  onFocus,
}: {
  row: TimelineRow;
  isLast: boolean;
  onFocus: (point: EventMapPoint) => void;
}) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { timeline, point } = row;

  const color = resolveColor(point.eventPointTag?.tagColor ?? point.eventPointTag?.color, theme.primary);
  const startTime = formatSimpleTime(timeline.timelineStartTime);
  const endTime = timeline.timelineEndTime ? formatSimpleTime(timeline.timelineEndTime) : null;

  return (
    <View style={styles.timelineItemContainer}>
      {/* ── Left Column: Time + Spine ── */}
      <View style={styles.leftColumn}>
        <Text style={[styles.timeLabel, { color: theme.foreground }]}>{startTime}</Text>
        {endTime && <Text style={[styles.timeLabelEnd, { color: theme.mutedForeground }]}>{endTime}</Text>}

        <View style={styles.spineWrapper}>
          <View style={[styles.spine, { backgroundColor: theme.border }, isLast && { height: '50%' }]} />
          <View style={[styles.node, { borderColor: color, backgroundColor: theme.card }]} />
        </View>
      </View>

      {/* ── Right Column: Event Content ── */}
      <View style={styles.rightColumn}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onFocus(point)}
          style={[styles.eventContent, { backgroundColor: theme.background, borderColor: theme.border }]}
        >
          <View style={styles.eventMain}>
            <Text style={[styles.eventTitle, { color: theme.foreground }]} numberOfLines={2}>
              {timeline.timelineName || 'Untitled event'}
            </Text>

            <View style={styles.locationRow}>
              <MapPin size={12} color={theme.mutedForeground} />
              <Text style={[styles.locationText, { color: theme.mutedForeground }]} numberOfLines={1}>
                {point.pointName ?? point.name}
              </Text>
            </View>
          </View>

          <View style={styles.eventActionArea}>
            <View style={[styles.tagPill, { backgroundColor: color + '15' }]}>
              <Text style={[styles.tagText, { color }]}>{point.eventPointTag?.name ?? 'Event'}</Text>
            </View>
            <View style={[styles.navCircle, { backgroundColor: color }]}>
              <Navigation size={12} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  timelineItemContainer: {
    flexDirection: 'row',
    minHeight: 80,
  },
  leftColumn: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 16,
    position: 'relative',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  timeLabelEnd: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 30,
  },
  spineWrapper: {
    position: 'absolute',
    right: -1, // Align with the edge
    top: 0,
    bottom: 0,
    width: 2,
    alignItems: 'center',
  },
  spine: {
    width: 2,
    flex: 1,
  },
  node: {
    position: 'absolute',
    top: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    zIndex: 2,
  },
  /* Right Column: Content */
  rightColumn: {
    flex: 1,
    paddingLeft: 16,
    paddingBottom: 20,
  },
  eventContent: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventMain: {
    flex: 1,
    gap: 4,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  eventActionArea: {
    alignItems: 'flex-end',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  navCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});