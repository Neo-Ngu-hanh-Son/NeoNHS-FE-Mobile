import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../../types';
import { IconButton } from '@/components/Buttons/IconButton';
import PointDetailModalHeader from './PointDetailModalHeader';
import PointDetailModalImage from './PointDetailModalImage';
import PointDetailModalDescription from './PointDetailModalDescription';
import { Button } from '@/components/ui/button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.45;

interface PointDetailModalProps {
  point: MapPoint | null;
  visible: boolean;
  onClose: () => void;
  onViewDetails?: (point: MapPoint) => void;
}

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

export default function MapPointDetailModal({
  point,
  visible,
  onClose,
  onViewDetails,
}: PointDetailModalProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!point) return null;

  const isEvent = point.type === 'EVENT';
  const isWorkshop = point.type === 'WORKSHOP';
  const isCheckin = point.type === 'CHECKIN';

  const detailRows = [
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
  ];

  const primaryActionLabel = isEvent
    ? 'View event'
    : isWorkshop
      ? 'View workshop'
      : isCheckin
        ? 'Open parent point'
        : 'Guide me there';

  const secondaryActionLabel = isEvent
    ? 'Event details'
    : isWorkshop
      ? 'Workshop details'
      : isCheckin
        ? 'Check-in details'
        : 'View details';

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  backgroundColor: theme.card,
                  transform: [{ translateY: slideAnim }],
                },
              ]}>
              {/* Handle bar */}
              <View style={styles.handleContainer}>
                <View style={[styles.handle, { backgroundColor: theme.border }]} />
              </View>

              <IconButton
                icon={'close'}
                borderless
                onPress={onClose}
                variant="ghost"
                iconSize={20}
                buttonStyle={styles.closeButton}
              />

              <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
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
                        <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>
                          {row.label}
                        </Text>
                        <Text style={[styles.detailValue, { color: theme.foreground }]}>
                          {row.value}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action buttons */}
                <View style={styles.actions}>
                  <Button
                    // icon="navigate"
                    onPress={() => onViewDetails?.(point)}
                    variant="default">
                    <Text>View details</Text>
                  </Button>

                  {/* <IconButton
                    icon="bookmark-outline"
                    variant="outline"
                    onPress={() => onViewDetails?.(point)}>
                    <Text>{secondaryActionLabel}</Text>
                  </IconButton> */}
                </View>
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    borderRadius: 9999,
    zIndex: 10,
    backgroundColor: THEME.light.muted + '30',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
    width: 32,
    height: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  imageContainer: {
    height: 160,
    width: 160,
    borderRadius: 9999,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
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
