import React, { useState, useCallback } from 'react';
import { View, FlatList, Dimensions, Image as RNImage } from 'react-native';

import { WorkshopImageResponse } from '../types';
import { SmartImage } from '@/components/ui/smart-image';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAX_HEIGHT = 360;
const MIN_HEIGHT = 200;

interface WorkshopImageGalleryProps {
  images: WorkshopImageResponse[];
  primaryColor: string;
  mutedColor: string;
}

export default function WorkshopImageGallery({ images, primaryColor, mutedColor }: WorkshopImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageHeight, setImageHeight] = useState(280);

  const imageList = images.map((img) => img.imageUrl);

  const onFirstImageLoad = useCallback(() => {
    if (imageList.length === 0) return;
    RNImage.getSize(
      imageList[0],
      (width: number, height: number) => {
        const ratio = height / width;
        const calculated = Math.round(SCREEN_WIDTH * ratio);
        setImageHeight(Math.max(MIN_HEIGHT, Math.min(calculated, MAX_HEIGHT)));
      },
      () => setImageHeight(280)
    );
  }, [imageList]);

  React.useEffect(() => {
    onFirstImageLoad();
  }, [onFirstImageLoad]);

  if (imageList.length === 0) return null;

  return (
    <View>
      <FlatList
        data={imageList}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <SmartImage
            uri={item}
            style={{
              width: SCREEN_WIDTH,
              height: imageHeight,
            }}
            contentFit="contain"
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
