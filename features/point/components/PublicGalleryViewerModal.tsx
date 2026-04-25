import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Platform, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureViewer } from 'react-native-gesture-image-viewer';
import { SmartImage } from '@/components/ui/smart-image';
import { ReviewImageResponse } from '@/features/reviews';
import { Text } from '@/components/ui/text';
import { formatDateTime } from '@/features/event/utils/helpers';

type Props = {
  visible: boolean;
  images: ReviewImageResponse[];
  initialIndex: number;
  onClose: () => void;
};

export function PublicGalleryViewerModal({ visible, images, initialIndex, onClose }: Props) {
  const viewerData = images.map(img => ({ ...img, uri: img.imageUrl }));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureViewer
        data={viewerData}
        initialIndex={initialIndex}
        onDismiss={onClose}
        renderItem={(item) => (
          <SmartImage
            uri={item.uri}
            style={styles.fullImage}
            contentFit="contain" />
        )}
        renderContainer={(children, helpers) => (
          <View style={styles.container}>
            {children}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => helpers.dismiss()}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            {/* Meta data at the bottom */}
            <View className='absolute left-4 bottom-10 bg-black/20 p-2 rounded-lg'>
              <View className='flex-row items-center space-x-1'>
                <Ionicons name="camera-outline" size={16} color="white" />
                <Text className="text-white/60 text-xs font-medium">
                  {images[initialIndex].authorName}
                </Text>
              </View>
              <View className='flex-row items-center space-x-1'>
                <Ionicons name="calendar-outline" size={16} color="white" />
                <Text className="text-white/60 text-xs font-medium">
                  {formatDateTime(images[initialIndex].takenDate)}
                </Text>
              </View>
            </View>
          </View>
        )} ListComponent={FlatList} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  }
});