import React, { useCallback, useMemo, useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { ReviewImageSelector } from '@/features/reviews/components/ReviewImageSelector';

interface ReviewModalProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  onClose?: () => void;
  destinationName: string;
  checkinPointId?: string;
  checkinImageUrl?: string;
  isSubmitting?: boolean;
  onSubmit?: (payload: { rating: number; description: string; imageUrls: string[] }) => Promise<void> | void;
}

export const AfterCheckinReviewModal = ({
  sheetRef,
  onClose,
  destinationName,
  checkinPointId,
  checkinImageUrl,
  isSubmitting = false,
  onSubmit,
}: ReviewModalProps) => {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState('');
  const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>(checkinImageUrl ? [checkinImageUrl] : []);
  const snapPoints = useMemo(() => ['92%'], []);

  const resetForm = useCallback(() => {
    setRating(0);
    setDescription('');
    setSelectedImageUrls(checkinImageUrl ? [checkinImageUrl] : []);
  }, [checkinImageUrl]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} pressBehavior="close" />
    ),
    []
  );

  const handleDismiss = useCallback(() => {
    resetForm();
    onClose?.();
  }, [onClose, resetForm]);

  const handlePostReview = async () => {
    if (rating <= 0) {
      Alert.alert('Rating required', 'Please select a star rating before posting your review.');
      return;
    }

    await onSubmit?.({
      rating,
      description: description.trim(),
      imageUrls: selectedImageUrls,
    });
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.background }}
      handleIndicatorStyle={{ backgroundColor: theme.border }}>
      <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text className="text-center text-2xl font-black text-foreground">Review your visit</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            How was your time at {destinationName}?
          </Text>
        </Animated.View>

        {/* Star Rating Section */}
        <Animated.View entering={FadeInDown.delay(120)} className="flex-row justify-center gap-3 pb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
              <Animated.View entering={ZoomIn.delay(star * 50)}>
                <FontAwesome
                  name={star <= rating ? 'star' : 'star-o'}
                  size={36}
                  color={star <= rating ? '#FFD700' : '#E2E8F0'}
                />
              </Animated.View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Description Input */}
        <Animated.View entering={FadeInUp.delay(200)} className="mb-6">
          <Text className="mb-2 ml-1 text-sm font-bold text-muted-foreground">DESCRIPTION</Text>
          <TextInput
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholder="Share your experience with other travelers..."
            className="h-32 rounded-3xl border border-muted/50 bg-muted/30 p-4 text-start align-top text-base text-foreground"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
          />
        </Animated.View>

        {/* Image Selector */}
        <Animated.View entering={FadeInUp.delay(80)} className="mb-6 mt-5">
          <ReviewImageSelector
            checkinPointId={checkinPointId}
            selectedUrls={selectedImageUrls}
            onSelectionChange={setSelectedImageUrls}
          />
        </Animated.View>

        {/* Submit Button */}
        <Animated.View entering={FadeInUp.delay(320)}>
          <Button
            onPress={handlePostReview}
            disabled={rating <= 0 || isSubmitting}
            className="h-16 rounded-2xl bg-primary shadow-xl shadow-primary/40">
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-xl font-black text-white">Post Review</Text>
            )}
          </Button>
        </Animated.View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};
