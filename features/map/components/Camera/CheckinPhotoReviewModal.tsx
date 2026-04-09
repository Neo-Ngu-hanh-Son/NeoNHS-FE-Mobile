import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type CheckinPhotoReviewModalProps = {
  sheetRef: React.RefObject<BottomSheet | null>;
  photoUri: string | null;
  caption: string;
  isSubmitting: boolean;
  isSavingPhoto?: boolean;
  onClose?: () => void;
  onCaptionChange: (value: string) => void;
  onSavePhoto?: () => void;
  onTakeAnother: () => void;
  onFinishCheckin: () => void;
};

export default function CheckinPhotoReviewModal({
  sheetRef,
  photoUri,
  caption,
  isSubmitting,
  isSavingPhoto = false,
  onClose,
  onCaptionChange,
  onSavePhoto,
  onTakeAnother,
  onFinishCheckin,
}: CheckinPhotoReviewModalProps) {
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const snapPoints = useMemo(() => ['90%'], []);

  useEffect(() => {
    setHasPreviewError(false);
  }, [photoUri]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} pressBehavior="close" />
    ),
    []
  );

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose?.();
      }
    },
    [onClose]
  );

  const handleTakeAnotherPress = useCallback(() => {
    sheetRef.current?.close();
    onTakeAnother();
  }, [onTakeAnother, sheetRef]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={handleSheetChange}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.background }}
      handleIndicatorStyle={{ backgroundColor: theme.border }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      detached={true}
      bottomInset={8}>
      <BottomSheetScrollView
        className="rounded-t-3xl"
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-foreground">Review photo</Text>
          <TouchableOpacity
            onPress={() => sheetRef.current?.close()}
            disabled={isSubmitting}
            className="h-9 w-9 items-center justify-center rounded-full bg-muted">
            <Ionicons name="close" size={20} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        {photoUri && !hasPreviewError ? (
          <Image
            key={photoUri}
            source={{ uri: photoUri }}
            className="max-h-screen-safe-offset-0 mb-4 aspect-[3/4] w-full rounded-2xl"
            contentFit="contain"
            transition={0}
            onError={() => setHasPreviewError(true)}
          />
        ) : (
          <View className="mb-4 h-64 w-full items-center justify-center rounded-2xl bg-muted">
            <Text className="text-sm text-muted-foreground">Unable to preview this image</Text>
          </View>
        )}

        <View className="mb-6">
          <Text className="mb-2 text-sm text-muted-foreground">Caption (optional)</Text>
          <Input
            value={caption}
            onChangeText={onCaptionChange}
            editable={!isSubmitting}
            placeholder="Write a caption for this check-in photo"
          />
        </View>

        <View className="gap-3">
          {onSavePhoto ? (
            <Button
              onPress={onSavePhoto}
              variant="outline"
              disabled={isSubmitting || isSavingPhoto || !photoUri}
              className="h-12 rounded-xl">
              <Text>{isSavingPhoto ? 'Saving...' : 'Save to Phone'}</Text>
            </Button>
          ) : null}
          <Button
            onPress={handleTakeAnotherPress}
            variant="outline"
            disabled={isSubmitting || isSavingPhoto || !photoUri}
            className="h-12 rounded-xl">
            <Text>Take Another</Text>
          </Button>
          <Button
            onPress={onFinishCheckin}
            disabled={isSubmitting || isSavingPhoto || !photoUri}
            className="h-12 rounded-xl">
            <Text>{isSubmitting ? 'Finishing...' : 'Finish Check-in'}</Text>
          </Button>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
