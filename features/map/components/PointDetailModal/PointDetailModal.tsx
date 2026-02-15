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

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.45;

interface PointDetailModalProps {
  point: MapPoint | null;
  visible: boolean;
  onClose: () => void;
  onNavigate?: (point: MapPoint) => void;
  onViewDetails?: (point: MapPoint) => void;
}

export default function PointDetailModal({
  point,
  visible,
  onClose,
  onNavigate,
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

                {/* Action buttons */}
                <View style={styles.actions}>
                  <IconButton icon="navigate" onPress={() => onNavigate?.(point)} variant="default">
                    <Text>Guide me there</Text>
                  </IconButton>

                  <IconButton
                    icon="bookmark-outline"
                    variant="outline"
                    onPress={() => onViewDetails?.(point)}>
                    <Text>View Details</Text>
                  </IconButton>
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
