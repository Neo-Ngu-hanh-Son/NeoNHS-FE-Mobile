import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

interface WriteReviewModalProps {
  visible: boolean;
  workshopName: string;
  /** When provided the modal opens in edit mode with pre-filled values. */
  initialRating?: number;
  initialText?: string;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => Promise<void>;
}

export function WriteReviewModal({
  visible,
  workshopName,
  initialRating,
  initialText,
  onClose,
  onSubmit,
}: WriteReviewModalProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const isEditMode = !!initialRating;

  const [selectedRating, setSelectedRating] = useState(initialRating ?? 0);
  const [reviewText, setReviewText] = useState(initialText ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const starScales = useRef(Array.from({ length: 5 }, () => new Animated.Value(1))).current;

  // Re-seed state every time the modal opens so edits always start from the
  // latest saved values (important when switching between create and edit).
  useEffect(() => {
    if (visible) {
      setSelectedRating(initialRating ?? 0);
      setReviewText(initialText ?? '');
    }
  }, [visible, initialRating, initialText]);

  const animateStar = (index: number) => {
    Animated.sequence([
      Animated.timing(starScales[index], { toValue: 1.4, duration: 120, useNativeDriver: true }),
      Animated.timing(starScales[index], { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const handleStarPress = (rating: number) => {
    setSelectedRating(rating);
    animateStar(rating - 1);
  };

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      Alert.alert('Rating required', 'Please select a star rating before submitting.');
      return;
    }
    if (reviewText.trim().length < 10) {
      Alert.alert('Review too short', 'Please write at least 10 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(selectedRating, reviewText.trim());
      handleClose();
    } catch {
      Alert.alert('Error', 'Failed to submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        </TouchableWithoutFeedback>

        {/* Sheet */}
        <View
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingBottom: Platform.OS === 'ios' ? 34 : 24,
          }}>
          {/* Drag handle */}
          <View className="items-center pt-3 pb-1">
            <View className="h-1 w-10 rounded-full" style={{ backgroundColor: theme.muted }} />
          </View>

          {/* Header */}
          <View
            className="flex-row items-center justify-between border-b px-5 pb-4 pt-2"
            style={{ borderColor: theme.border }}>
            <View className="flex-1">
              <Text className="text-lg font-black" style={{ color: theme.foreground }}>
                {isEditMode ? 'Edit Your Review' : 'Write a Review'}
              </Text>
              <Text
                className="mt-0.5 text-xs"
                style={{ color: theme.mutedForeground }}
                numberOfLines={1}>
                {workshopName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="rounded-full p-2"
              style={{ backgroundColor: theme.muted }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={18} color={theme.foreground} />
            </TouchableOpacity>
          </View>

          <View className="px-5 pt-5 gap-5">
            {/* Star picker */}
            <View className="items-center gap-3">
              <Text className="text-sm font-semibold" style={{ color: theme.mutedForeground }}>
                {isEditMode ? 'Update your rating' : 'How was your experience?'}
              </Text>
              <View className="flex-row gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => handleStarPress(star)} activeOpacity={0.7}>
                    <Animated.View style={{ transform: [{ scale: starScales[star - 1] }] }}>
                      <Ionicons
                        name={star <= selectedRating ? 'star' : 'star-outline'}
                        size={40}
                        color={star <= selectedRating ? '#f97316' : theme.muted}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
              {selectedRating > 0 && (
                <Text className="text-sm font-bold" style={{ color: '#f97316' }}>
                  {ratingLabels[selectedRating]}
                </Text>
              )}
            </View>

            {/* Divider */}
            <View className="h-px" style={{ backgroundColor: theme.border }} />

            {/* Text input */}
            <View>
              <Text className="mb-2 text-sm font-semibold" style={{ color: theme.foreground }}>
                {isEditMode ? 'Update your comment' : 'Share your experience'}
              </Text>
              <TextInput
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="Tell others what you loved, learned, or suggest improvements..."
                placeholderTextColor={theme.mutedForeground}
                multiline
                numberOfLines={4}
                maxLength={500}
                style={{
                  backgroundColor: theme.muted,
                  borderRadius: 14,
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 12,
                  color: theme.foreground,
                  fontSize: 14,
                  lineHeight: 22,
                  minHeight: 110,
                  textAlignVertical: 'top',
                }}
              />
              <Text className="mt-1 text-right text-[11px]" style={{ color: theme.mutedForeground }}>
                {reviewText.length}/500
              </Text>
            </View>

            {/* Submit button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting || selectedRating === 0}
              activeOpacity={0.8}
              style={{
                backgroundColor: selectedRating === 0 ? theme.muted : theme.primary,
                borderRadius: 16,
                paddingVertical: 15,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}>
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons
                  name={isEditMode ? 'pencil' : 'checkmark-circle'}
                  size={20}
                  color={selectedRating === 0 ? theme.mutedForeground : '#fff'}
                />
              )}
              <Text
                className="text-base font-bold"
                style={{ color: selectedRating === 0 ? theme.mutedForeground : '#fff' }}>
                {isSubmitting
                  ? isEditMode ? 'Saving…' : 'Submitting…'
                  : isEditMode ? 'Save Changes' : 'Submit Review'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
