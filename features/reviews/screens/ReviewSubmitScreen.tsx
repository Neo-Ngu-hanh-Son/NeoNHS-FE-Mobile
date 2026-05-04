import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, View, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Star } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';
import { ReviewImageSelector } from '@/features/reviews/components/ReviewImageSelector';
import { useCreateReview } from '@/features/reviews/hooks/useReview';
import type { ReviewTypeFlgValue } from '@/features/reviews/types';

interface ReviewSubmitScreenProps {
  reviewTypeFlg: ReviewTypeFlgValue;
  reviewTypeId: string;
  checkinPointId?: string;
  title?: string;
  subtitle?: string;
  initialComment?: string;
  initialRating?: number;
  initialSelectedUrls?: string[];
  onSubmitted?: () => void;
}

export default function ReviewSubmitScreen({
  reviewTypeFlg,
  reviewTypeId,
  checkinPointId,
  title = 'Viết đánh giá',
  subtitle,
  initialComment = '',
  initialRating = 0,
  initialSelectedUrls = [],
  onSubmitted,
}: ReviewSubmitScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = useMemo(() => (isDarkColorScheme ? THEME.dark : THEME.light), [isDarkColorScheme]);
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [selectedUrls, setSelectedUrls] = useState<string[]>(initialSelectedUrls);
  const createReviewMutation = useCreateReview();

  const handleSubmit = async () => {
    if (!reviewTypeFlg || !reviewTypeId) {
      Alert.alert('Missing target', 'Review type and target must be provided.');
      return;
    }

    if (rating <= 0) {
      Alert.alert('Vui lòng chọn đánh giá', 'Vui lòng chọn đánh giá trước khi gửi đánh giá của bạn.');
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        reviewTypeFlg,
        reviewTypeId,
        rating,
        comment: comment.trim() || undefined,
        imageUrls: selectedUrls.length > 0 ? selectedUrls : undefined,
      });

      Alert.alert('Thành công', 'Cảm ơn bạn đã chia sẻ trải nghiệm của mình.');
      onSubmitted?.();
    } catch (error) {
      Alert.alert('Thất bại', error instanceof Error ? error.message : 'Không thể gửi đánh giá của bạn ngay bây giờ.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAwareScrollView
        enableOnAndroid
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={50}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 28 }}>
        <View className="gap-6">
          <View>
            <Text className="text-2xl font-bold text-foreground">{title}</Text>
            {subtitle ? <Text className="mt-1 text-sm text-muted-foreground">{subtitle}</Text> : null}
          </View>

          <ReviewImageSelector
            checkinPointId={checkinPointId}
            selectedUrls={selectedUrls}
            onSelectionChange={setSelectedUrls}
          />

          <View className="gap-3">
            <Text className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Đánh giá</Text>
            <View className="flex-row justify-center gap-3 rounded-3xl border border-border bg-card px-4 py-5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isActive = star <= rating;

                return (
                  <TouchableOpacity
                    key={star}
                    activeOpacity={0.7}
                    onPress={() => setRating(star)}
                    className="rounded-full p-1">
                    <Star
                      size={32}
                      color={isActive ? '#FACC15' : theme.mutedForeground}
                      fill={isActive ? '#FACC15' : 'transparent'}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Bình luận</Text>
            <TextInput
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholder="Chia sẻ trải nghiệm của bạn với những người khác..."
              placeholderTextColor={theme.mutedForeground}
              value={comment}
              onChangeText={setComment}
              className="min-h-[140px] rounded-3xl border border-border bg-card p-4 text-base text-foreground"
            />
          </View>

          <Button
            onPress={handleSubmit}
            disabled={rating <= 0 || createReviewMutation.isPending}
            className="h-14 rounded-2xl bg-primary">
            {createReviewMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-base font-black text-white">Gửi đánh giá</Text>
            )}
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
