import React, { useRef, useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

import { RatingSummary } from './RatingSummary';
import { ReviewCard } from './ReviewCard';
import { WriteReviewSheet, WriteReviewSheetRef } from './WriteReviewSheet';
import type { Review } from '../types';
import { useAuth } from '@/features/auth';

export interface ReviewSectionProps {
  /** Target identifier (e.g., workshopId, artisanId) */
  targetId: string;
  /** Presentation name (e.g., workshop name, user name) */
  targetName: string;
  
  averageRating: number;
  totalRatings: number;
  
  /** All loaded reviews to display and calculate distributions */
  reviews: Review[];
  isLoading: boolean;
  
  /** My review if any */
  myReview?: Review;

  onSubmitReview: (rating: number, text: string) => Promise<void>;
  onViewAll: () => void;
  onSheetVisibilityChange?: (visible: boolean) => void;
}

export function ReviewSection({
  targetId,
  targetName,
  averageRating,
  totalRatings,
  reviews,
  isLoading,
  myReview,
  onSubmitReview,
  onViewAll,
  onSheetVisibilityChange,
}: ReviewSectionProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { user } = useAuth();
  
  const sheetRef = useRef<WriteReviewSheetRef>(null);

  // Show only first 2 reviews as a preview
  const previewReviews = reviews.slice(0, 2);

  const barCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) counts[5 - r.rating]++;
    }
    return counts;
  }, [reviews]);

  const reviewButtonLabel = myReview ? 'Edit your review' : 'Write a review';
  const reviewButtonIcon = myReview ? 'pencil-outline' : 'create-outline';

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-black tracking-tight">Reviews</Text>
        {user && (
          <TouchableOpacity
            className="flex-row items-center gap-1"
            activeOpacity={0.7}
            onPress={() => sheetRef.current?.present()}>
            <Ionicons name={reviewButtonIcon} size={14} color={theme.primary} />
            <Text className="text-sm font-bold" style={{ color: theme.primary }}>
              {reviewButtonLabel}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <RatingSummary averageRating={averageRating} totalRatings={totalRatings} barCounts={barCounts} />

      {isLoading ? (
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={theme.primary} />
        </View>
      ) : previewReviews.length > 0 ? (
        previewReviews.map((review) => (
          <ReviewCard key={review.id} item={review} isOwn={review.user.id === user?.id} />
        ))
      ) : (
        <View className="items-center py-8 gap-2">
          <Ionicons name="chatbubble-outline" size={32} color={theme.mutedForeground} />
          <Text className="text-sm" style={{ color: theme.mutedForeground }}>
            No reviews yet. Be the first to share your experience!
          </Text>
        </View>
      )}

      {totalRatings > 0 && (
        <TouchableOpacity
          className="flex-row items-center justify-center gap-1 py-1"
          activeOpacity={0.7}
          onPress={onViewAll}>
          <Text className="text-sm font-bold" style={{ color: theme.primary }}>
            View all {totalRatings} reviews
          </Text>
          <Ionicons name="arrow-forward" size={14} color={theme.primary} />
        </TouchableOpacity>
      )}

      <WriteReviewSheet
        ref={sheetRef}
        targetName={targetName}
        initialRating={myReview?.rating}
        initialText={myReview?.comment ?? ''}
        onSubmit={onSubmitReview}
        onVisibilityChange={onSheetVisibilityChange}
      />
    </View>
  );
}
