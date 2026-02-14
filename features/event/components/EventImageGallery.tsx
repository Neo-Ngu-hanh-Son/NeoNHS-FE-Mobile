import React, { useState } from "react";
import { View, Image, FlatList, Dimensions } from "react-native";

import { EventImageResponse } from "../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface EventImageGalleryProps {
  images?: EventImageResponse[];
  thumbnailUrl?: string | null;
  primaryColor: string;
  mutedColor: string;
}

export default function EventImageGallery({
  images,
  thumbnailUrl,
  primaryColor,
  mutedColor,
}: EventImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const imageList =
    images && images.length > 0
      ? images.map((img) => img.imageUrl)
      : thumbnailUrl
      ? [thumbnailUrl]
      : [];

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
          const idx = Math.round(
            e.nativeEvent.contentOffset.x / SCREEN_WIDTH
          );
          setActiveIndex(idx);
        }}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width: SCREEN_WIDTH, height: 260 }}
            className="object-cover"
          />
        )}
      />
      {imageList.length > 1 && (
        <View className="flex-row items-center justify-center gap-1.5 mt-2">
          {imageList.map((_, i) => (
            <View
              key={i}
              className="rounded-full"
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                backgroundColor:
                  i === activeIndex ? primaryColor : mutedColor,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
