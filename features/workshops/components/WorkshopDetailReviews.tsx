import React, { useMemo, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useAuth } from '@/features/auth';
import { WriteReviewModal } from './WriteReviewModal';
import { useWorkshopReviews, useCreateWorkshopReview, useUpdateWorkshopReview } from '../hooks';
import type { WorkshopReviewResponse } from '../types';

// ── Helpers ────────────────────────────────────────────

function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? 's' : ''} ago`;
}

// ── Sub-components ─────────────────────────────────────

interface RatingSummaryProps {
  averageRating: number;
  totalRatings: number;
  /** Counts for stars 5→4→3→2→1 (index 0 = 5-star, index 4 = 1-star) */
  barCounts: number[];
}

function RatingSummary({ averageRating, totalRatings, barCounts }: RatingSummaryProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const fullStars = Math.floor(averageRating);
  const hasHalf = averageRating - fullStars >= 0.25;
  const maxCount = Math.max(...barCounts, 1);

  return (
    <Card className="rounded-2xl py-5">
      <CardContent className="flex-row items-center gap-6 px-5">
        <View className="items-center">
          <Text className="mb-1 text-4xl font-black">{averageRating.toFixed(1)}</Text>
          <View className="flex-row gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => (
              <Ionicons key={`full-${i}`} name="star" size={12} color={theme.primary} />
            ))}
            {hasHalf && <Ionicons name="star-half" size={12} color={theme.primary} />}
            {Array.from({ length: 5 - fullStars - (hasHalf ? 1 : 0) }).map((_, i) => (
              <Ionicons key={`empty-${i}`} name="star-outline" size={12} color={theme.primary} />
            ))}
          </View>
          <Text className="mt-1.5 text-[11px] text-muted-foreground">
            {totalRatings} review{totalRatings !== 1 ? 's' : ''}
          </Text>
        </View>

        <View className="flex-1 gap-1.5">
          {barCounts.map((count, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="w-3 text-right text-[11px] text-muted-foreground">{5 - i}</Text>
              <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <View
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </View>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}

function ReviewCard({ item, isOwn }: { item: WorkshopReviewResponse; isOwn: boolean }) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const avatarUri = item.user.avatarUrl ?? undefined;

  return (
    <Card className="rounded-2xl py-4">
      <CardContent className="gap-3 px-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                className="h-10 w-10 rounded-full"
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="person" size={20} color={theme.mutedForeground} />
              </View>
            )}
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-bold">{item.user.fullname}</Text>
                {isOwn && (
                  <View
                    style={{
                      backgroundColor: theme.primary,
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                    }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>YOU</Text>
                  </View>
                )}
              </View>
              <Text className="text-[11px] text-muted-foreground">
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name={i < item.rating ? 'star' : 'star-outline'}
              size={12}
              color="#f97316"
            />
          ))}
        </View>

        {!!item.comment && (
          <Text className="text-sm leading-6 text-muted-foreground">{item.comment}</Text>
        )}

        {item.imageUrls.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {item.imageUrls.slice(0, 3).map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={{ width: 64, height: 64, borderRadius: 8 }}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────

interface WorkshopDetailReviewsProps {
  workshopId: string;
  workshopName: string;
  averageRating: number;
  totalRatings: number;
  onViewAll: () => void;
}

export function WorkshopDetailReviews({
  workshopId,
  workshopName,
  averageRating,
  totalRatings,
  onViewAll,
}: WorkshopDetailReviewsProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useWorkshopReviews(workshopId, 'createdAt,desc');
  const createReviewMutation = useCreateWorkshopReview(workshopId);
  const updateReviewMutation = useUpdateWorkshopReview(workshopId);

  const allLoaded = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data]
  );

  // Detect whether the current user already has a review
  const myReview: WorkshopReviewResponse | undefined = useMemo(
    () => (user ? allLoaded.find((r) => r.user.id === user.id) : undefined),
    [allLoaded, user]
  );

  // Show only first 2 reviews as a preview
  const previewReviews = allLoaded.slice(0, 2);

  const barCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of allLoaded) {
      if (r.rating >= 1 && r.rating <= 5) counts[5 - r.rating]++;
    }
    return counts;
  }, [allLoaded]);

  const handleSubmit = async (rating: number, text: string): Promise<void> => {
    if (myReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: myReview.id,
        request: { rating, comment: text },
      });
      Alert.alert('Updated!', 'Your review has been updated.');
    } else {
      await createReviewMutation.mutateAsync({
        workshopTemplateId: workshopId,
        rating,
        comment: text,
      });
      Alert.alert('Thank you!', 'Your review has been submitted.');
    }
  };

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
            onPress={() => setShowModal(true)}>
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

      <WriteReviewModal
        visible={showModal}
        workshopName={workshopName}
        initialRating={myReview?.rating}
        initialText={myReview?.comment}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}
