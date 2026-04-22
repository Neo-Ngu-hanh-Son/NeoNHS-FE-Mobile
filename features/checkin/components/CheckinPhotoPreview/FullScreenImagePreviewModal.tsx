import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { fitContainer, ResumableZoom, useImageResolution } from 'react-native-zoom-toolkit';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  photoUri: string | null;
  onPreviewClose: (value: boolean) => void;
  isPreviewOpen: boolean;
};

export default function FullScreenImagePreviewModal({ photoUri, onPreviewClose, isPreviewOpen }: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { top } = useSafeAreaInsets();

  // Resolution hook for the zoom logic
  const { isFetching, resolution } = useImageResolution({ uri: photoUri || '' });
  // Calculate the correct image size for the fullscreen viewer
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const zoomImageSize = useMemo(() => {
    if (!resolution) return { width: 0, height: 0 };
    return fitContainer(resolution.width / resolution.height, {
      width: windowWidth,
      height: windowHeight,
    });
  }, [resolution, windowWidth, windowHeight]);

  const handleClosePreview = (value: boolean) => () => {
    onPreviewClose(value);
  };
  return (
    <Modal visible={isPreviewOpen} transparent animationType="fade">
      <GestureHandlerRootView className="flex-1">
        <View className="flex-1 bg-black">
          {isFetching || !resolution ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="white" />
            </View>
          ) : (
            <ResumableZoom maxScale={resolution} tapsEnabled={true} pinchEnabled={true} panEnabled={true}>
              <Image
                source={{ uri: photoUri || '' }}
                style={{ width: zoomImageSize.width, height: zoomImageSize.height }}
                contentFit="contain"
              />
            </ResumableZoom>
          )}

          {/* Floating Close Button */}
          <TouchableOpacity
            onPress={() => handleClosePreview(false)}
            style={{ position: 'absolute', top: top + 10, right: 20 }}
            className="h-10 w-10 items-center justify-center rounded-full bg-muted/50">
            <Ionicons name="close" size={22} color={theme.foreground} />
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
