import React, { useState, useEffect, useMemo } from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet, FlatList, useWindowDimensions } from 'react-native';
import { GestureViewer } from 'react-native-gesture-image-viewer';
import { Ionicons } from '@expo/vector-icons';
import { SmartImage } from '@/components/ui/smart-image';
import { formatDateTime } from '@/features/event/utils/helpers';

export interface ViewerImageItem {
  imageUrl: string;
  caption?: string | null;
  takenAt?: string | Date | null;
  parentPointName?: string | null;
  destinationName?: string | null;
  checkinPointName?: string | null;
}

interface ImageViewerModalProps {
  visible: boolean;
  images: ViewerImageItem[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageViewerModal({
  visible,
  images,
  initialIndex = 0,
  onClose,
}: ImageViewerModalProps) {
  // Track the currently viewed image to update metadata on swipe
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const { width, height } = useWindowDimensions();

  // Sync state if modal opens with a new initial index
  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
    }
  }, [visible, initialIndex]);
  if (!visible || !images?.length) return null;

  const activeViewerImage = images[currentIndex];
  const isMetaDataVisible = activeViewerImage.caption ||
    activeViewerImage.takenAt || activeViewerImage.parentPointName || activeViewerImage.destinationName || activeViewerImage.checkinPointName;



  // Helper to safely get the location name
  const getLocationName = (img: ViewerImageItem) => {
    return img.parentPointName || img.destinationName || img.checkinPointName || 'Unknown destination';
  };


  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <GestureViewer
        data={images}
        initialIndex={initialIndex}
        ListComponent={FlatList}
        onDismiss={onClose}
        renderItem={(item: ViewerImageItem) => (
          <SmartImage
            uri={item.imageUrl}
            style={{
              width,
              height,
            }}
            contentFit='contain'
          />
        )}
        renderContainer={(children, helpers) => (
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.85)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {children}

            {/* Close Button */}
            <TouchableOpacity
              className='absolute top-12 right-4 p-2 bg-black/50 rounded-full'
              onPress={() => helpers.dismiss()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>

            {/* Metadata Overlay */}
            {isMetaDataVisible && (
              <View style={styles.viewerMetadataWrapper} pointerEvents="box-none">
                <View style={styles.metadataContent}>
                  <Text className="text-base font-semibold text-white">
                    {activeViewerImage?.caption || 'Không có mô tả'}
                  </Text>

                  {activeViewerImage?.takenAt && (
                    <Text className="mt-1 text-xs text-white/80">
                      {formatDateTime(activeViewerImage?.takenAt?.toString())}
                    </Text>
                  )}

                  <Text className="mt-1 text-xs text-white/80">
                    {getLocationName(activeViewerImage)}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  viewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  viewerCloseButton: {
    position: 'absolute',
    top: 50, // Adjust this if you need more clearance from the dynamic island/notch
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 6,
  },
  viewerMetadataWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  metadataContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40, // Extra padding for devices without physical home buttons
    backgroundColor: 'rgba(0,0,0,0.5)', // Adds readability if the image is bright
  }
});