import React from 'react';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

export default function ImagePreviewThumbnail({
  photoUri,
  previewError,
  onPreviewOpen,
  onPreviewError,
  onSavePhoto,
  isSavingPhoto,
}: {
  photoUri: string | null;
  previewError: boolean;
  onPreviewOpen: () => void;
  onPreviewError: () => void;
  onSavePhoto?: () => void;
  isSavingPhoto?: boolean;
}) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPreviewOpen}
      className="relative mb-6 overflow-hidden rounded-3xl border border-border shadow-sm">
      {photoUri && !previewError ? (
        <View>
          <Image
            source={{ uri: photoUri }}
            className="aspect-[3/4] w-full"
            contentFit="cover"
            onError={onPreviewError}
          />
          {/* Floating Save Action */}
          {onSavePhoto && (
            <TouchableOpacity
              onPress={onSavePhoto}
              disabled={isSavingPhoto}
              className="absolute bottom-4 right-4 h-12 w-12 items-center justify-center rounded-full bg-background/80 blur-md">
              {isSavingPhoto ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="download-outline" size={24} color={theme.primary} />
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="aspect-[3/4] w-full items-center justify-center bg-muted">
          <Ionicons name="image-outline" size={48} color={theme.mutedForeground} />
        </View>
      )}
    </TouchableOpacity>
  );
}
