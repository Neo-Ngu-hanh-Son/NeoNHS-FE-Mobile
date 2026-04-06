import React, { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureViewer, useGestureViewerState } from 'react-native-gesture-image-viewer';

import { SmartImage } from '@/components/ui/smart-image';
import { Text } from '@/components/ui/text';
import { CheckinSessionGalleryImage } from '../../types';

type CheckinGalleryViewerModalProps = {
  visible: boolean;
  images: CheckinSessionGalleryImage[];
  initialIndex: number;
  onClose: () => void;
};

export default function CheckinGalleryViewerModal({
  visible,
  images,
  initialIndex,
  onClose,
}: CheckinGalleryViewerModalProps) {
  const { currentIndex } = useGestureViewerState();

  const safeInitialIndex = useMemo(() => {
    if (!images.length) {
      return 0;
    }
    return Math.min(Math.max(initialIndex, 0), images.length - 1);
  }, [images.length, initialIndex]);

  const activeImage = useMemo(() => {
    if (!images.length) {
      return null;
    }

    const index = Math.min(Math.max(currentIndex, 0), images.length - 1);
    return images[index] ?? images[safeInitialIndex] ?? null;
  }, [currentIndex, images, safeInitialIndex]);

  if (!images.length) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureViewer
        data={images}
        initialIndex={safeInitialIndex}
        ListComponent={ScrollView}
        renderItem={(item) => <SmartImage uri={item.uri} style={styles.viewerImage} contentFit="contain" />}
        onDismiss={onClose}
        renderContainer={(children, helpers) => (
          <View style={styles.viewerContainer}>
            {children}

            <TouchableOpacity style={styles.viewerCloseButton} onPress={() => helpers.dismiss()}>
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>

            {activeImage ? (
              <View style={styles.viewerMetadataContainer}>
                <Text className="text-base font-semibold text-white">
                  {activeImage.caption?.trim() || 'No caption'}
                </Text>
                <Text className="mt-1 text-xs text-white/80">{activeImage.label}</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerCloseButton: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerMetadataContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.62)',
  },
});
