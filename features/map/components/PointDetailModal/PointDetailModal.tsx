import React, { forwardRef, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../../types';
import PointDetailModalHeader from './PointDetailModalHeader';
import PointDetailModalImage from './PointDetailModalImage';
import PointDetailModalDescription from './PointDetailModalDescription';
import { Button } from '@/components/ui/button';

interface PointDetailModalProps {
  point: MapPoint | null;
  onClose: () => void;
  onAfterClose?: () => void;
  onViewDetails?: (point: MapPoint) => void;
}

export type MapPointDetailSheetRef = BottomSheetModal;

const formatDateTime = (value?: string) => {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const formatParticipants = (current?: number, max?: number) => {
  if (typeof current !== 'number' && typeof max !== 'number') return 'N/A';
  if (typeof current === 'number' && typeof max === 'number') return `${current}/${max}`;
  return String(current ?? max ?? 'N/A');
};

const MapPointDetailModal = forwardRef<MapPointDetailSheetRef, PointDetailModalProps>(
  ({ point, onClose, onAfterClose, onViewDetails }: PointDetailModalProps, ref) => {
    const { isDarkColorScheme } = useTheme();
    const theme = isDarkColorScheme ? THEME.dark : THEME.light;

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.3} pressBehavior="close" />
      ),
      []
    );

    const isEvent = point?.type === 'EVENT';
    const isWorkshop = point?.type === 'WORKSHOP';

    const detailRows = point
      ? [
          ...(isEvent || isWorkshop
            ? [
                { label: 'Start time', value: formatDateTime(point.startTime) },
                { label: 'End time', value: formatDateTime(point.endTime) },
                {
                  label: 'Participants',
                  value: formatParticipants(point.currentEnrolled, point.maxParticipants),
                },
              ]
            : []),
          ...(isWorkshop
            ? [
                {
                  label: 'Organizer',
                  value: point.workshopOrganizerName || 'N/A',
                },
              ]
            : []),
        ]
      : [];

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
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled">
          {point ? (
            <>
              <View style={styles.headerRow}>
                <View style={styles.headerColumn}>
                  <PointDetailModalHeader point={point} />
                </View>
                <View style={styles.imageColumn}>
                  <PointDetailModalImage point={point} />
                </View>
              </View>

              <PointDetailModalDescription point={point} />

              {detailRows.length > 0 && (
                <View style={[styles.detailSection, { borderColor: theme.border }]}>
                  {detailRows.map((row) => (
                    <View key={row.label} style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>{row.label}</Text>
                      <Text style={[styles.detailValue, { color: theme.foreground }]}>{row.value}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actions}>
                <Button onPress={() => onViewDetails?.(point)} variant="default">
                  <Text>View details</Text>
                </Button>
              </View>
            </>
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

MapPointDetailModal.displayName = 'MapPointDetailModal';

export default MapPointDetailModal;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeRow: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  closeButton: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-around',
  },
  detailSection: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 20,
  },
  headerColumn: {
    flex: 7,
  },
  imageColumn: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
});
