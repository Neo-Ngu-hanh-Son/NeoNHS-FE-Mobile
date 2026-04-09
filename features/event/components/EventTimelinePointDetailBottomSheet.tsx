import React, { forwardRef, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import type { EventMapPoint } from '../types';

export type EventTimelinePointDetailSheetRef = BottomSheetModal;

type EventTimelinePointDetailSheetProps = {
  point: EventMapPoint | null;
  onAfterClose?: () => void;
  onStartNavigate?: (point: EventMapPoint) => void;
  onNavigateFromCurrentLocation?: (point: EventMapPoint) => void;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateFull(dateValue?: string): string {
  if (!dateValue || dateValue === 'unscheduled') return '';
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimeRange(start?: string, end?: string): string {
  if (!start && !end) return '';
  const fmt = (t?: string) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    return h && m ? `${h}:${m}` : t;
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start) || fmt(end);
}

function resolveTagColor(color?: string | null, fallback = '#15803d'): string {
  if (!color) return fallback;
  const c = color.trim();
  return c.startsWith('#') ? c : fallback;
}

function hexAlpha(hex: string, alpha: string): string {
  const base = hex.length === 4 ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}` : hex;
  return `${base}${alpha}`;
}

function isEnded(point: EventMapPoint): boolean {
  if (!point.timelineDate) return false;
  const endStr = point.timelineEndTime
    ? `${point.timelineDate}T${point.timelineEndTime}`
    : `${point.timelineDate}T23:59:59`;
  const end = new Date(endStr);
  return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
}

function isOngoing(point: EventMapPoint): boolean {
  if (!point.timelineDate) return false;
  const now = Date.now();
  const startStr = point.timelineStartTime ? `${point.timelineDate}T${point.timelineStartTime}` : null;
  const endStr = point.timelineEndTime
    ? `${point.timelineDate}T${point.timelineEndTime}`
    : `${point.timelineDate}T23:59:59`;
  const end = new Date(endStr);
  if (Number.isNaN(end.getTime()) || end.getTime() < now) return false;
  if (startStr) {
    const start = new Date(startStr);
    return !Number.isNaN(start.getTime()) && start.getTime() <= now;
  }
  return false;
}

type StatusInfo = { label: string; color: string; bg: string; icon: string };

function resolveStatus(point: EventMapPoint): StatusInfo {
  if (isOngoing(point)) {
    return { label: 'Ongoing', color: '#10b981', bg: '#10b98118', icon: 'radio-button-on' };
  }
  if (isEnded(point)) {
    return { label: 'Ended', color: '#64748b', bg: '#64748b18', icon: 'checkmark-circle' };
  }
  return { label: 'Upcoming', color: '#f59e0b', bg: '#f59e0b18', icon: 'time-outline' };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function InfoRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  theme,
}: {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string | null;
  theme: typeof THEME.light;
}) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={16} color={iconColor} />
      </View>
      <View style={styles.infoText}>
        <Text style={[styles.infoLabel, { color: theme.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: theme.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

function Divider({ theme }: { theme: typeof THEME.light }) {
  return <View style={[styles.divider, { backgroundColor: theme.border }]} />;
}

// ─── Main component ──────────────────────────────────────────────────────────

const EventTimelinePointDetailBottomSheet = forwardRef<
  EventTimelinePointDetailSheetRef,
  EventTimelinePointDetailSheetProps
>(({ point, onAfterClose, onStartNavigate, onNavigateFromCurrentLocation }, ref) => {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.35} pressBehavior="close" />
    ),
    []
  );

  if (!point) {
    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        enableDynamicSizing
        onDismiss={onAfterClose}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}>
        <View style={{ height: 80 }} />
      </BottomSheetModal>
    );
  }

  const tagColor = resolveTagColor(point.eventPointTag?.tagColor ?? point.eventPointTag?.color, theme.primary);
  const tagName = point.eventPointTag?.name ?? 'Event';
  const tagBg = hexAlpha(tagColor, '20');
  const tagBorder = hexAlpha(tagColor, '55');
  const headerAccentBg = hexAlpha(tagColor, '12');

  const status = resolveStatus(point);
  const timeRange = formatTimeRange(point.timelineStartTime, point.timelineEndTime);
  const dateLabel = formatDateFull(point.timelineDate);
  const lunarDate = point.timelineLunarDate ?? point.groupLunarDate;
  const images = point.pointImages ?? (point.thumbnailUrl ? [point.thumbnailUrl] : []);
  const heroImage = images[0];
  const extraImages = images.slice(1, 4);

  const hasOrganizer = Boolean(point.timelineOrganizer?.trim());
  const hasCoOrganizer = Boolean(point.timelineCoOrganizer?.trim());

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={['50%', '80%']}
      onDismiss={onAfterClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.card }}
      handleIndicatorStyle={{ backgroundColor: tagColor, width: 36, height: 3 }}>
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled">
        {/* ── Hero image ─────────────────────────────── */}
        {heroImage ? (
          <View style={styles.heroWrap}>
            <Image source={{ uri: heroImage }} style={styles.hero} contentFit="cover" transition={300} />
            {/* Tag chip overlaid on image */}
            <View style={[styles.heroTagChip, { backgroundColor: tagColor }]}>
              {point.eventPointTag?.iconUrl ? (
                <Image source={{ uri: point.eventPointTag.iconUrl }} style={styles.heroTagIcon} contentFit="cover" />
              ) : null}
              <Text style={styles.heroTagText}>{tagName}</Text>
            </View>
          </View>
        ) : null}

        {/* ── Colored accent header ───────────────────── */}
        <View style={[styles.accentHeader, { backgroundColor: headerAccentBg }]}>
          {/* Tag chip (no-image fallback path) */}
          {!heroImage && (
            <View style={styles.topRow}>
              <View style={[styles.tagChip, { backgroundColor: tagBg, borderColor: tagBorder }]}>
                {point.eventPointTag?.iconUrl ? (
                  <Image source={{ uri: point.eventPointTag.iconUrl }} style={styles.tagIcon} contentFit="cover" />
                ) : null}
                <Text style={[styles.tagText, { color: tagColor }]}>{tagName}</Text>
              </View>
              <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
                <Ionicons name={status.icon as any} size={11} color={status.color} style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            </View>
          )}

          {/* Timeline name = title */}
          <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={3}>
            {point.timelineName ?? point.name}
          </Text>

          {/* Status + time row */}
          <View style={styles.timePill}>
            {heroImage && (
              <View style={[styles.statusChipInline, { backgroundColor: status.bg }]}>
                <Ionicons name={status.icon as any} size={11} color={status.color} style={{ marginRight: 4 }} />
                <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
              </View>
            )}
            {timeRange ? (
              <View style={[styles.timeBlock, { backgroundColor: hexAlpha(tagColor, '18'), borderColor: tagBorder }]}>
                <Ionicons name="time-outline" size={13} color={tagColor} />
                <Text style={[styles.timeText, { color: tagColor }]}>{timeRange}</Text>
              </View>
            ) : null}
          </View>

          {/* Date row */}
          {dateLabel ? (
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={theme.mutedForeground} />
              <Text style={[styles.dateText, { color: theme.mutedForeground }]}>{dateLabel}</Text>
              {lunarDate ? (
                <View
                  style={[
                    styles.lunarBadge,
                    { backgroundColor: hexAlpha('#f59e0b', '18'), borderColor: hexAlpha('#f59e0b', '44') },
                  ]}>
                  <Text style={[styles.lunarText, { color: '#b45309' }]}>{lunarDate}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={styles.body}>
          {/* ── Physical location card ──────────────────── */}
          {(point.pointName ?? point.address) ? (
            <View style={[styles.locationCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={[styles.locationIconWrap, { backgroundColor: hexAlpha('#ef4444', '18') }]}>
                {point.eventPointTag?.iconUrl ? (
                  <Image source={{ uri: point.eventPointTag.iconUrl }} style={styles.locationIcon} contentFit="cover" />
                ) : (
                  <Ionicons name="location" size={20} color="#ef4444" />
                )}
              </View>
              <View style={{ flex: 1 }}>
                {point.pointName ? (
                  <Text style={[styles.locationName, { color: theme.foreground }]} numberOfLines={2}>
                    {point.pointName}
                  </Text>
                ) : null}
                {point.address ? (
                  <Text style={[styles.locationAddress, { color: theme.mutedForeground }]} numberOfLines={3}>
                    {point.address}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}

          {/* ── Description ─────────────────────────────── */}
          {point.timelineDescription ? (
            <>
              <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>Description</Text>
              <Text style={[styles.description, { color: theme.foreground }]}>{point.timelineDescription}</Text>
              <Divider theme={theme} />
            </>
          ) : null}

          {/* ── Info rows ────────────────────────────────── */}
          {hasOrganizer || hasCoOrganizer ? (
            <View style={[styles.infoCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <InfoRow
                icon="business-outline"
                iconColor="#8b5cf6"
                iconBg={hexAlpha('#8b5cf6', '18')}
                label="Organizer"
                value={point.timelineOrganizer}
                theme={theme}
              />
              {hasOrganizer && hasCoOrganizer ? (
                <View style={[styles.infoCardDivider, { backgroundColor: theme.border }]} />
              ) : null}
              <InfoRow
                icon="people-outline"
                iconColor="#0ea5e9"
                iconBg={hexAlpha('#0ea5e9', '18')}
                label="Co-Organizer"
                value={point.timelineCoOrganizer}
                theme={theme}
              />
            </View>
          ) : null}

          {/* ── Extra images strip ───────────────────────── */}
          {extraImages.length > 0 ? (
            <View style={styles.imagesSection}>
              <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
                {images.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.imgThumbWrap}>
                    <Image
                      source={{ uri }}
                      style={[styles.imgThumb, { borderColor: theme.border }]}
                      contentFit="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {/* ── CTA button ────────────────────────────────── */}
        <View style={[styles.ctaWrap, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => onStartNavigate?.(point)}
            activeOpacity={0.85}
            style={[styles.cta, { backgroundColor: tagColor }]}
            accessibilityLabel="Start navigation action">
            <Ionicons name="navigate" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.ctaText}>Get Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onNavigateFromCurrentLocation?.(point)}
            activeOpacity={0.85}
            style={[styles.ctaSecondary, { borderColor: tagColor, backgroundColor: theme.background }]}
            accessibilityLabel="Navigate from current location">
            <Ionicons name="locate" size={18} color={tagColor} style={{ marginRight: 8 }} />
            <Text style={[styles.ctaSecondaryText, { color: tagColor }]}>Navigate From Current Location</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

EventTimelinePointDetailBottomSheet.displayName = 'EventTimelinePointDetailSheet';
export default EventTimelinePointDetailBottomSheet;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  // Hero
  heroWrap: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  hero: {
    width: '100%',
    height: '100%',
  },
  heroTagChip: {
    position: 'absolute',
    top: 12,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroTagIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  heroTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  // Accent header
  accentHeader: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '65%',
  },
  tagIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusChipInline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 27,
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
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lunarBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lunarText: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Body
  body: {
    paddingHorizontal: 18,
    paddingTop: 4,
    gap: 16,
  },
  // Location card
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  locationIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
  },
  locationName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 12,
    lineHeight: 17,
  },
  // Description
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    marginVertical: -4,
    borderRadius: 1,
  },
  // Info card (organizer block)
  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  infoCardDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  // Images
  imagesSection: {
    gap: 10,
  },
  imagesRow: {
    marginHorizontal: -18,
    paddingHorizontal: 18,
  },
  imgThumbWrap: {
    marginRight: 10,
  },
  imgThumb: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
  },
  // CTA
  ctaWrap: {
    marginTop: 8,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  ctaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  ctaSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
  },
  ctaSecondaryText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
