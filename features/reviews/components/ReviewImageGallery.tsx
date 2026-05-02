import React, { useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';

import type { ReviewImageResponse } from '@/features/reviews/types';
import { Text } from '@/components/ui/text';
import { ReviewImageViewerModal } from '@/features/reviews/components/ReviewImageViewerModal';

type ReviewImageGalleryProps = {
  images: ReviewImageResponse[];
  maxPreviewCount?: number;
};

export function ReviewImageGallery({ images, maxPreviewCount = 4 }: ReviewImageGalleryProps) {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const previewImages = useMemo(() => images.slice(0, maxPreviewCount), [images, maxPreviewCount]);
  const hiddenCount = Math.max(0, images.length - previewImages.length);

  if (!images.length) {
    return null;
  }

  return (
    <>
      <View className="flex-row flex-wrap gap-2">
        {previewImages.map((image, index) => {
          const isLastPreview = index === previewImages.length - 1;
          const shouldShowMoreOverlay = hiddenCount > 0 && isLastPreview;

          return (
            <TouchableOpacity
              key={`${image.imageUrl}-${index}`}
              activeOpacity={0.8}
              className="h-16 w-16 overflow-hidden rounded-lg"
              onPress={() => {
                setSelectedIndex(index);
                setViewerVisible(true);
              }}>
              <Image source={{ uri: image.imageUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />

              {shouldShowMoreOverlay ? (
                <View className="absolute inset-0 items-center justify-center bg-black/55">
                  <Text className="text-xs font-bold text-white">+{hiddenCount}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <ReviewImageViewerModal
        visible={viewerVisible}
        images={images}
        initialIndex={selectedIndex}
        onClose={() => setViewerVisible(false)}
      />
    </>
  );
}
