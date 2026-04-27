import React, { useMemo } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { GestureViewer, useGestureViewerState } from 'react-native-gesture-image-viewer';
import { Ionicons } from '@expo/vector-icons';

import { SmartImage } from '@/components/ui/smart-image';
import { Text } from '@/components/ui/text';
import type { ReviewImageResponse } from '@/features/reviews/types';

type ReviewImageViewerModalProps = {
  visible: boolean;
  images: ReviewImageResponse[];
  initialIndex: number;
  onClose: () => void;
};

function formatDateTime(isoDate?: string | null) {
  if (!isoDate) {
    return undefined;
  }

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function ReviewImageViewerModal({ visible, images, initialIndex, onClose }: ReviewImageViewerModalProps) {
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
        renderItem={(item) => <SmartImage uri={item.imageUrl} style={styles.viewerImage} contentFit="contain" />}
        onDismiss={onClose}
        renderContainer={(children, helpers) => (
          <View style={styles.viewerContainer}>
            {children}

            <TouchableOpacity style={styles.viewerCloseButton} onPress={() => helpers.dismiss()}>
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>

            {activeImage ? (
              <View style={styles.viewerMetadataContainer}>
                {activeImage.authorName ? (
                  <Text className="text-sm font-semibold text-white">{activeImage.authorName}</Text>
                ) : null}
                {formatDateTime(activeImage.takenDate) ? (
                  <Text className="mt-1 text-xs text-white/80">{formatDateTime(activeImage.takenDate)}</Text>
                ) : null}
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
