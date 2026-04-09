import React, { forwardRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../../types';
import { getMarkerStyle } from '../Marker/MarkerStyles';
import {
  hexAlpha,
  formatDateTime,
  formatParticipants,
  formatEstTime,
  resolveTypeLabel,
  resolveStatus,
} from './helpers';
import PointDetailHero from './PointDetailHero';
import PointDetailAccentHeader from './PointDetailAccentHeader';
import PointDetailBody from './PointDetailBody';
import PointDetailCTA from './PointDetailCTA';

// ─── Types ───────────────────────────────────────────────────────────────────

export type MapPointDetailSheetRef = BottomSheetModal;

interface PointDetailModalProps {
  point: MapPoint | null;
  onClose: () => void;
  onAfterClose?: () => void;
  onViewDetails?: (point: MapPoint) => void;
  onNavigateFromCurrentLocation?: (point: MapPoint) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const MapPointDetailModal = forwardRef<MapPointDetailSheetRef, PointDetailModalProps>(
  ({ point, onAfterClose, onViewDetails, onNavigateFromCurrentLocation }, ref) => {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.35}
          pressBehavior="close"
        />
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

    const markerStyle = getMarkerStyle(point.type);
    const accentColor = markerStyle.bg;
    const accentBorder = hexAlpha(accentColor, '55');
    const headerAccentBg = hexAlpha(accentColor, '12');

    const typeLabel = resolveTypeLabel(point.type);
    const status = resolveStatus(point);
    const isEventOrWorkshop = point.type === 'EVENT' || point.type === 'WORKSHOP';

    const heroImage = point.thumbnailUrl;
    const startStr = formatDateTime(point.startTime);
    const endStr = formatDateTime(point.endTime);
    const participantsStr = formatParticipants(point.currentEnrolled, point.maxParticipants);
    const estTimeStr = formatEstTime(point.estTimeSpent);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        enableDynamicSizing
        onDismiss={onAfterClose}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: accentColor, width: 36, height: 3 }}>
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">

          {heroImage ? (
            <PointDetailHero
              heroImage={heroImage}
              accentColor={accentColor}
              markerStyle={markerStyle}
              typeLabel={typeLabel}
              status={status}
            />
          ) : null}

          <PointDetailAccentHeader
            name={point.name}
            accentColor={accentColor}
            accentBorder={accentBorder}
            headerAccentBg={headerAccentBg}
            markerStyle={markerStyle}
            typeLabel={typeLabel}
            status={status}
            heroImage={heroImage}
            isEventOrWorkshop={isEventOrWorkshop}
            startStr={startStr}
            estTimeStr={estTimeStr}
            historyAudioCount={point.historyAudioCount}
            theme={theme}
          />

          <PointDetailBody
            description={point.description}
            shortDescription={point.shortDescription}
            isEventOrWorkshop={isEventOrWorkshop}
            accentColor={accentColor}
            startStr={startStr}
            endStr={endStr}
            participantsStr={participantsStr}
            workshopOrganizerName={point.workshopOrganizerName}
            estTimeStr={estTimeStr}
            panoramaImageUrl={point.panoramaImageUrl}
            theme={theme}
          />

          <PointDetailCTA
            accentColor={accentColor}
            theme={theme}
            onViewDetails={() => onViewDetails?.(point)}
            onNavigate={() => onNavigateFromCurrentLocation?.(point)}
          />

        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

MapPointDetailModal.displayName = 'MapPointDetailModal';
export default MapPointDetailModal;

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 24,
  },
});
