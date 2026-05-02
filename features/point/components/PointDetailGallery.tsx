import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, FlatList } from 'react-native';
import { Text } from '@/components/ui/text';
import { SmartImage } from '@/components/ui/smart-image';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { ReviewImageResponse } from '@/features/reviews';
import { PublicGalleryViewerModal } from './PublicGalleryViewerModal';

const { width } = Dimensions.get('window');
const THUMB_SIZE = width * 0.32;

export function PointDetailGallery({ publicImages, isLoading, isError, refetchImages }: {
  publicImages: ReviewImageResponse[];
  isLoading: boolean;
  isError: boolean;
  refetchImages: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();

  if (isLoading) return <ActivityIndicator className="py-8" />;
  if (isError) return <Text className="text-center py-4">Error loading images</Text>;
  if (publicImages.length === 0) return null;

  const handleNavigateToSeeAllGallery = () => {
    console.log('handleNavigateToSeeAllGallery');
  }

  return (
    <View className="gap-4">
      {/* Header row */}
      <View className="flex-row items-center justify-between px-1">
        <Text className="text-xl font-black tracking-tight">{t('point.checkin_gallery')}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handleNavigateToSeeAllGallery}>
          <Text className="text-sm font-bold" style={{ color: theme.primary }}>
            {t('common.see_all')}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={publicImages}
        horizontal
        showsHorizontalScrollIndicator={false}
        // Using contentContainerStyle for padding and gap
        contentContainerStyle={{
          paddingHorizontal: 16,
          columnGap: 12 // Modern RN supports columnGap/rowGap in style
        }}
        keyExtractor={(item, index) => item.authorId + "_" + index}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setSelectedIndex(index)}
          >
            <SmartImage
              uri={item.imageUrl}
              style={{ width: THUMB_SIZE, height: THUMB_SIZE }}
              className="rounded-3xl bg-muted"
              contentFit="cover"
            />
          </TouchableOpacity>
        )}
      />

      <PublicGalleryViewerModal
        visible={selectedIndex !== null}
        images={publicImages}
        initialIndex={selectedIndex ?? 0}
        onClose={() => setSelectedIndex(null)}
      />
    </View>
  );
}