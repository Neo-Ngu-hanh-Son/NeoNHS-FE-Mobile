import React, { forwardRef, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { CalendarDays, Compass, MapPin } from 'lucide-react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import type { EventMapPoint } from '../types';
import { EventTimelineAccordion } from './EventMapComponents/EventPointTimelineAccordion';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type EventTimelinePointDetailSheetRef = BottomSheetModal;

type EventTimelinePointDetailSheetProps = {
  point: EventMapPoint | null;
  onAfterClose?: () => void;
  onStartNavigate?: (point: EventMapPoint) => void;
  onNavigateFromCurrentLocation?: (point: EventMapPoint) => void;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeHexColor(color: string, fallback: string): string {
  const value = color.trim();
  const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(value);

  if (!isHex) {
    return fallback;
  }

  if (value.length === 4 || value.length === 5) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  if (value.length === 9) {
    // Normalize to #RRGGBB and ignore incoming alpha to avoid malformed #...AAAA colors.
    return value.slice(0, 7);
  }

  return value;
}

function resolveTagColor(color?: string | null, fallback = '#15803d'): string {
  if (!color) return fallback;
  return normalizeHexColor(color, fallback);
}

function hexAlpha(hex: string, alpha: string): string {
  const base = normalizeHexColor(hex, '#15803d');
  const normalizedAlpha = /^[0-9a-fA-F]{2}$/.test(alpha) ? alpha : 'FF';
  return `${base}${normalizedAlpha}`;
}

// ─── Main component ──────────────────────────────────────────────────────────

const EventTimelinePointDetailBottomSheet = forwardRef<
  EventTimelinePointDetailSheetRef,
  EventTimelinePointDetailSheetProps
>(({ point, onAfterClose, onNavigateFromCurrentLocation }, ref) => {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { top } = useSafeAreaInsets();

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

  const timelines = point.timelineInfos ?? [];
  const images = point.pointImages ?? (point.thumbnailUrl ? [point.thumbnailUrl] : []);
  const heroImage = images[0];
  const extraImages = images.slice(1);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={['50%', '100%']}
      onDismiss={onAfterClose}
      topInset={top}
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
              <View style={[styles.countChip, { backgroundColor: hexAlpha(tagColor, '18'), borderColor: tagBorder }]}>
                <CalendarDays size={16} color={tagColor} />
                <Text style={[styles.countText, { color: tagColor }]}>
                  {timelines.length} {timelines.length === 1 ? 'timeline' : 'timelines'}
                </Text>
              </View>
            </View>
          )}

          {/* Point name */}
          <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={3}>
            {point.pointName ?? point.name}
          </Text>

          {/* Meta row */}
          <View style={styles.timePill}>
            {heroImage ? (
              <View style={[styles.countChip, { backgroundColor: hexAlpha(tagColor, '18'), borderColor: tagBorder }]}>
                <CalendarDays size={16} color={tagColor} />
                <Text style={[styles.countText, { color: tagColor }]}>
                  {timelines.length} {timelines.length === 1 ? 'event' : 'events'}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          {/* ── Physical location card ──────────────────── */}
          {(point.pointName ?? point.address) ? (
            <View style={[styles.locationCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={[styles.locationIconWrap, { backgroundColor: hexAlpha('#ef4444', '18') }]}>
                {point.eventPointTag?.iconUrl ? (
                  <Image source={{ uri: point.eventPointTag.iconUrl }} style={styles.locationIcon} contentFit="cover" />
                ) : (
                  <MapPin size={16} color="#ef4444" />
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

          {/* ── Timeline accordion ───────────────────────── */}
          <View style={styles.timelineSection}>
            <Text style={[styles.sectionLabel, { color: theme.mutedForeground }]}>Event happening in this day</Text>
            <Text style={[styles.timelineHint, { color: theme.mutedForeground }]}>Tap to view details.</Text>
            <EventTimelineAccordion point={point} />
          </View>

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
            onPress={() => onNavigateFromCurrentLocation?.(point)}
            activeOpacity={0.8}
            style={[styles.cta, { backgroundColor: tagColor }]}
            accessibilityLabel="Start navigation action">
            <Compass size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.ctaText}>Get Directions</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => onNavigateFromCurrentLocation?.(point)}
            activeOpacity={0.85}
            style={[styles.ctaSecondary, { borderColor: tagColor, backgroundColor: theme.background }]}
            accessibilityLabel="Navigate from current location">
            <Ionicons name="locate" size={18} color={tagColor} style={{ marginRight: 8 }} />
            <Text style={[styles.ctaSecondaryText, { color: tagColor }]}>Navigate From Current Location</Text>
          </TouchableOpacity> */}
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
    paddingBottom: 24,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  // Accent header
  accentHeader: {
    paddingHorizontal: 16,
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
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  countText: {
    fontSize: 14,
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
  // Body
  body: {
    paddingHorizontal: 16,
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
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Description
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  timelineSection: {
    gap: 8,
  },
  timelineHint: {
    fontSize: 14,
    lineHeight: 20,
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
    paddingHorizontal: 16,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
