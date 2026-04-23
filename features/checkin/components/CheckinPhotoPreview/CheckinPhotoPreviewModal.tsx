import React, { RefObject, useCallback, useEffect, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CheckinPhotoPreviewActions from './CheckinPhotoPreviewActions';
import FullScreenImagePreviewModal from './FullScreenImagePreviewModal';
import ImagePreviewThumbnail from './ImagePreviewThumbnail';

type CheckinPhotoPreviewModalProps = {
  sheetRef: RefObject<BottomSheet | null>;
  photoUri: string | null;
  caption: string;
  isSubmitting: boolean;
  isSavingPhoto?: boolean;
  onCaptionChange: (value: string) => void;
  onSavePhoto?: () => void;
  onTakeAnother: () => void;
  onFinishCheckin: () => void;
  handleCancelCheckinPhoto?: () => void;
};

export default function CheckinPhotoPreviewModal({
  sheetRef,
  photoUri,
  caption,
  isSubmitting,
  isSavingPhoto = false,
  onCaptionChange,
  onSavePhoto,
  onTakeAnother,
  onFinishCheckin,
  handleCancelCheckinPhoto,
}: CheckinPhotoPreviewModalProps) {
  const [hasPreviewError, setHasPreviewError] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    setHasPreviewError(false);
  }, [photoUri]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.6} />
    ),
    []
  );

  const handleFinishCheckin = () => {
    onFinishCheckin();
    sheetRef.current?.close();
  };

  const handleTakeAnother = () => {
    onTakeAnother();
    sheetRef.current?.close();
  };

  return (
    <>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={['100%']}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.background }}
        handleIndicatorStyle={{ backgroundColor: theme.mutedForeground, width: 40 }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        topInset={top}>
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: bottom + 20,
            paddingTop: 10,
          }}
          keyboardShouldPersistTaps="handled">
          {/* Header Section */}
          <View className="mb-6 flex-row items-center justify-between">
            <View>
              <Text className="text-2xl font-bold text-foreground">Review Photo</Text>
              <Text className="text-sm text-muted-foreground">Add a note to your check-in</Text>
            </View>
            <TouchableOpacity
              onPress={handleCancelCheckinPhoto}
              disabled={isSubmitting}
              className="h-10 w-10 items-center justify-center rounded-full bg-muted/50">
              <Ionicons name="close" size={22} color={theme.foreground} />
            </TouchableOpacity>
          </View>

          {/* Thumbnail Trigger */}
          <ImagePreviewThumbnail
            photoUri={photoUri}
            previewError={hasPreviewError}
            onPreviewOpen={() => setIsPreviewOpen(true)}
            onPreviewError={() => setHasPreviewError(true)}
            onSavePhoto={onSavePhoto}
            isSavingPhoto={isSavingPhoto}
          />

          {/* Input Section */}
          <View className="mb-8">
            <BottomSheetTextInput
              value={caption}
              onChangeText={onCaptionChange}
              editable={!isSubmitting}
              placeholder="How's it looking? (Optional)"
              placeholderTextColor={theme.mutedForeground}
              style={{
                height: 56,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.muted,
                paddingHorizontal: 16,
                color: theme.foreground,
                fontSize: 16,
              }}
            />
          </View>

          {/* Action Buttons */}
          <CheckinPhotoPreviewActions
            onFinishCheckin={handleFinishCheckin}
            onTakeAnother={handleTakeAnother}
            isSubmitting={isSubmitting}
            isSavingPhoto={isSavingPhoto}
            photoUri={photoUri}
          />
        </BottomSheetScrollView>
      </BottomSheet>
      <FullScreenImagePreviewModal
        photoUri={photoUri}
        onPreviewClose={setIsPreviewOpen}
        isPreviewOpen={isPreviewOpen}
      />
    </>
  );
}
