import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../Marker/CustomMarker';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.45;

interface PointDetailModalProps {
  point: MapPoint | null;
  visible: boolean;
  onClose: () => void;
  onNavigate?: (point: MapPoint) => void;
}

const typeLabels: Record<MapPoint['type'], string> = {
  entrance: 'Lối vào',
  stairs: 'Cầu thang',
  junction: 'Ngã rẽ',
  checkpoint: 'Điểm check-in',
  landmark: 'Địa danh',
  waypoint: 'Điểm đường đi',
};

const typeColors: Record<MapPoint['type'], string> = {
  entrance: '#22c55e',
  stairs: '#3b82f6',
  junction: '#f59e0b',
  checkpoint: '#ef4444',
  landmark: '#8b5cf6',
  waypoint: '#6b7280',
};

const typeIcons: Record<MapPoint['type'], keyof typeof Ionicons.glyphMap> = {
  entrance: 'enter-outline',
  stairs: 'git-commit-outline',
  junction: 'git-branch-outline',
  checkpoint: 'flag-outline',
  landmark: 'business-outline',
  waypoint: 'location-outline',
};

export default function PointDetailModal({
  point,
  visible,
  onClose,
  onNavigate,
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

  const typeColor = typeColors[point.type];
  const typeLabel = typeLabels[point.type];
  const typeIcon = typeIcons[point.type];

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

              {/* Close button */}
              <Pressable
                style={[styles.closeButton, { backgroundColor: theme.muted + '30' }]}
                onPress={onClose}>
                <Ionicons name="close" size={20} color={theme.foreground} />
              </Pressable>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                {/* Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={
                      point.image ? { uri: point.image } : require('@/assets/images/NeoNHSLogo.png')
                    }
                    style={styles.image}
                    resizeMode="cover"
                  />
                  {/* Type badge */}
                  <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                    <Ionicons name={typeIcon} size={14} color="white" />
                    <Text style={styles.typeBadgeText}>{typeLabel}</Text>
                  </View>
                </View>

                {/* Title and info */}
                <View style={styles.infoSection}>
                  <Text style={[styles.title, { color: theme.foreground }]}>{point.title}</Text>

                  {/* Coordinates */}
                  <View style={styles.coordinatesRow}>
                    <Ionicons name="navigate-outline" size={14} color={theme.muted} />
                    <Text style={[styles.coordinates, { color: theme.muted }]}>
                      {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                    </Text>
                  </View>

                  {/* Description */}
                  {point.description && (
                    <Text style={[styles.description, { color: theme.foreground }]}>
                      {point.description}
                    </Text>
                  )}
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                  <Pressable
                    style={[styles.actionButton, { backgroundColor: theme.primary }]}
                    onPress={() => onNavigate?.(point)}>
                    <Ionicons name="navigate" size={18} color="white" />
                    <Text style={styles.actionButtonText}>Chỉ đường</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.secondaryButton, { borderColor: theme.border }]}
                    onPress={onClose}>
                    <Ionicons name="bookmark-outline" size={18} color={theme.foreground} />
                    <Text style={[styles.secondaryButtonText, { color: theme.foreground }]}>
                      Lưu
                    </Text>
                  </Pressable>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.6,
    minHeight: MODAL_HEIGHT,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  imageContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  coordinates: {
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
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
  actionButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
