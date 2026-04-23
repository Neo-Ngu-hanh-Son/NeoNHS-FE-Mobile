import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { CheckCircle2, ImagePlus, X } from 'lucide-react-native';

import imageService from '@/services/api/common/uploadImageService';
import { useAuth } from '@/features/auth';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import { generateImageUploadData } from '@/utils/uploadImageHelper';
import { useCheckinGallery } from '@/features/reviews/hooks/useReview';
import { MediaType } from 'expo-media-library';

type UploadingImageItem = {
  id: string;
  localUri: string;
};

export interface ReviewImageSelectorProps {
  checkinPointId?: string;
  selectedUrls: string[];
  onSelectionChange: (nextUrls: string[]) => void;
}

export function ReviewImageSelector({ checkinPointId, selectedUrls, onSelectionChange }: ReviewImageSelectorProps) {
  const { accessToken } = useAuth();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [uploadingItems, setUploadingItems] = useState<UploadingImageItem[]>([]);
  const { images: galleryImages, isLoading: isGalleryLoading } = useCheckinGallery(checkinPointId);
  const { mutateAsync: uploadImageAsync } = imageService.useUploadImage();

  const selectedUrlSet = useMemo(() => new Set(selectedUrls), [selectedUrls]);

  const toggleSelection = useCallback(
    (imageUrl: string) => {
      if (selectedUrlSet.has(imageUrl)) {
        onSelectionChange(selectedUrls.filter((url) => url !== imageUrl));
        return;
      }

      onSelectionChange([...selectedUrls, imageUrl]);
    },
    [onSelectionChange, selectedUrlSet, selectedUrls]
  );

  const handlePickAndUpload = useCallback(async () => {
    if (!accessToken) {
      Alert.alert('Login required', 'You need to be logged in to upload review photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 0.9,
      selectionLimit: 8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const pickedAssets = result.assets.filter((asset) => Boolean(asset.uri));
    if (!pickedAssets.length) {
      return;
    }

    const pendingEntries = pickedAssets.map((asset, index) => ({
      id: `upload-${Date.now()}-${index}`,
      localUri: asset.uri,
    }));

    setUploadingItems((current) => [...current, ...pendingEntries]);

    let nextUrls = [...selectedUrls];
    let failedUploads = 0;

    await Promise.all(
      pendingEntries.map(async (pendingItem) => {
        try {
          const uploadResponse = await uploadImageAsync({
            image: generateImageUploadData({ localUri: pendingItem.localUri }),
            token: accessToken,
          });

          if (!nextUrls.includes(uploadResponse.mediaUrl)) {
            nextUrls = [...nextUrls, uploadResponse.mediaUrl];
          }
        } catch {
          failedUploads += 1;
        } finally {
          setUploadingItems((current) => current.filter((entry) => entry.id !== pendingItem.id));
        }
      })
    );

    onSelectionChange(nextUrls);

    if (failedUploads > 0) {
      Alert.alert('Upload incomplete', `${failedUploads} image(s) failed to upload. Please try again.`);
    }
  }, [accessToken, onSelectionChange, selectedUrls, uploadImageAsync]);

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between gap-2">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePickAndUpload}
          className="flex-row items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2">
          <ImagePlus size={16} color={theme.primary} />
          <Text className="text-xs font-bold text-primary">Add Photo</Text>
        </TouchableOpacity>
      </View>

      {checkinPointId ? (
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Check-in Gallery</Text>

          {isGalleryLoading ? (
            <View className="h-24 flex-row items-center justify-center rounded-2xl border border-border bg-card">
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : galleryImages.length === 0 ? (
            <View className="h-24 items-center justify-center rounded-2xl border border-border bg-card px-3">
              <Text className="text-center text-xs text-muted-foreground">
                No check-in photos found for this location. You can still upload new photos.
              </Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={galleryImages}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 10 }}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedUrlSet.has(item.imageUrl);

                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleSelection(item.imageUrl)}
                    className={`h-24 w-24 overflow-hidden rounded-2xl border-2 ${
                      isSelected ? 'border-primary' : 'border-border'
                    }`}>
                    <Image
                      source={{ uri: item.imageUrl }}
                      contentFit="cover"
                      style={{ width: '100%', height: '100%' }}
                    />

                    {isSelected ? (
                      <View className="absolute right-1 top-1 rounded-full bg-black/60 p-1">
                        <CheckCircle2 size={14} color="#fff" />
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      ) : null}

      <View className="gap-2">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected Photos</Text>

        {selectedUrls.length === 0 && uploadingItems.length === 0 ? (
          <View className="h-24 items-center justify-center rounded-2xl border border-dashed border-border bg-card px-3">
            <Text className="text-center text-xs text-muted-foreground">No photos selected yet.</Text>
          </View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
            data={[
              ...selectedUrls.map((url) => ({ id: `selected-${url}`, kind: 'selected' as const, uri: url })),
              ...uploadingItems.map((item) => ({ id: item.id, kind: 'uploading' as const, uri: item.localUri })),
            ]}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              if (item.kind === 'uploading') {
                return (
                  <View className="h-24 w-24 items-center justify-center rounded-2xl border border-border bg-card">
                    <Image source={{ uri: item.uri }} contentFit="cover" style={{ width: '100%', height: '100%' }} />
                    <View className="absolute inset-0 items-center justify-center bg-black/40">
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  </View>
                );
              }

              return (
                <View className="h-24 w-24 overflow-hidden rounded-2xl border border-border bg-card">
                  <Image source={{ uri: item.uri }} contentFit="cover" style={{ width: '100%', height: '100%' }} />

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleSelection(item.uri)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1">
                    <X size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}
