import React, { useState } from 'react';
import { View, FlatList, Dimensions } from 'react-native';

import { WorkshopImageResponse } from '../types';
import { SmartImage } from '@/components/ui/smart-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GALLERY_HEIGHT = 280;

interface WorkshopImageGalleryProps {
  images: WorkshopImageResponse[];
  primaryColor: string;
  mutedColor: string;
}

export default function WorkshopImageGallery({ images, primaryColor, mutedColor }: WorkshopImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageList = images.map((img) => img.imageUrl?.trim()).filter((url): url is string => Boolean(url));

  if (imageList.length === 0) return null;

  return (
    <View>
      <FlatList
        data={imageList}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, i) => `${item}-${i}`}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <SmartImage
            uri={item}
            style={{
              width: SCREEN_WIDTH,
              height: GALLERY_HEIGHT,
            }}
            contentFit="cover"
          />
        )}
      />
      {imageList.length > 1 && (
        <View className="mt-2 flex-row items-center justify-center gap-1.5">
          {imageList.map((_, i) => (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                backgroundColor: i === activeIndex ? primaryColor : mutedColor,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
