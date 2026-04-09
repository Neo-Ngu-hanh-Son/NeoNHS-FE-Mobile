import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { THEME } from '@/lib/theme';
import { MarkerStyle } from '../Marker/MarkerStyles';
import { hexAlpha, StatusInfo } from './helpers';

type PointDetailAccentHeaderProps = {
  name: string;
  accentColor: string;
  accentBorder: string;
  headerAccentBg: string;
  markerStyle: MarkerStyle;
  typeLabel: string;
  status: StatusInfo | null;
  heroImage?: string;
  isEventOrWorkshop: boolean;
  startStr: string;
  estTimeStr: string;
  historyAudioCount?: number;
  theme: typeof THEME.light;
};

export default function PointDetailAccentHeader({
  name,
  accentColor,
  accentBorder,
  headerAccentBg,
  markerStyle,
  typeLabel,
  status,
  heroImage,
  isEventOrWorkshop,
  startStr,
  estTimeStr,
  historyAudioCount,
  theme,
}: PointDetailAccentHeaderProps) {
  return (
    <View style={[styles.accentHeader, { backgroundColor: headerAccentBg }]}>
      {/* Type chip + status chip row (no-image path) */}
      {!heroImage && (
        <View style={styles.topRow}>
          <View
            style={[
              styles.typeChip,
              { backgroundColor: hexAlpha(accentColor, '20'), borderColor: accentBorder },
            ]}>
            <MaterialCommunityIcons name={markerStyle.icon} size={12} color={accentColor} />
            <Text style={[styles.typeText, { color: accentColor }]}>{typeLabel}</Text>
          </View>
          {status ? (
            <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon as any} size={11} color={status.color} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Point name = title */}
      <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={3}>
        {name}
      </Text>

      {/* Status + start time row (events/workshops) */}
      {isEventOrWorkshop && (startStr || status) ? (
        <View style={styles.timePill}>
          {heroImage && status ? (
            <View style={[styles.statusChipInline, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon as any} size={11} color={status.color} style={{ marginRight: 4 }} />
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          ) : null}
          {startStr ? (
            <View
              style={[
                styles.timeBlock,
                { backgroundColor: hexAlpha(accentColor, '18'), borderColor: accentBorder },
              ]}>
              <Ionicons name="time-outline" size={13} color={accentColor} />
              <Text style={[styles.timeText, { color: accentColor }]}>{startStr}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Static POI meta row (estTime, audio) */}
      {!isEventOrWorkshop && (estTimeStr || (historyAudioCount ?? 0) > 0) ? (
        <View style={styles.timePill}>
          {estTimeStr ? (
            <View
              style={[
                styles.timeBlock,
                { backgroundColor: hexAlpha(accentColor, '18'), borderColor: accentBorder },
              ]}>
              <Ionicons name="walk-outline" size={13} color={accentColor} />
              <Text style={[styles.timeText, { color: accentColor }]}>{estTimeStr}</Text>
            </View>
          ) : null}
          {(historyAudioCount ?? 0) > 0 ? (
            <View
              style={[
                styles.timeBlock,
                { backgroundColor: hexAlpha('#8b5cf6', '18'), borderColor: hexAlpha('#8b5cf6', '55') },
              ]}>
              <Ionicons name="headset-outline" size={13} color="#8b5cf6" />
              <Text style={[styles.timeText, { color: '#8b5cf6' }]}>
                {historyAudioCount} audio guide{(historyAudioCount ?? 0) > 1 ? 's' : ''}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  accentHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    maxWidth: '65%',
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusChipInline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    letterSpacing: -0.3,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
