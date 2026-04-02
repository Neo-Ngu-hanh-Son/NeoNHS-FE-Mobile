import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { WriteReviewModal } from '../components/WriteReviewModal';
import { useAuth } from '@/features/auth';
import { useWorkshopReviews, useCreateWorkshopReview, useUpdateWorkshopReview, useWorkshopDetail } from '../hooks';
import type { ReviewSortKey } from '../hooks';
import type { WorkshopReviewResponse } from '../types';

type Props = StackScreenProps<MainStackParamList, 'WorkshopAllReviews'>;

// ── Helpers ────────────────────────────────────────────────────────────────

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

const SORT_OPTIONS: { label: string; value: ReviewSortKey }[] = [
  { label: 'Most Recent', value: 'createdAt,desc' },
  { label: 'Highest Rated', value: 'rating,desc' },
  { label: 'Lowest Rated', value: 'rating,asc' },
];

const FILTER_STARS = [0, 5, 4, 3, 2, 1] as const;
type FilterStar = (typeof FILTER_STARS)[number];

// ── Sub-components ─────────────────────────────────────────────────────────

function StarRow({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name={i < rating ? 'star' : 'star-outline'}
          size={size}
          color="#f97316"
        />
      ))}
    </View>
  );
}

function RatingSummaryBar({
  averageRating,
  totalRatings,
  barCounts,
  theme,
}: {
  averageRating: number;
  totalRatings: number;
  barCounts: number[];
  theme: typeof THEME.light;
}) {
  const fullStars = Math.floor(averageRating);
  const hasHalf = averageRating - fullStars >= 0.25;
  const maxCount = Math.max(...barCounts, 1);

  return (
    <Card className="rounded-2xl py-5 mx-4 mb-3">
      <CardContent className="flex-row items-center gap-6 px-5">
        <View className="items-center">
          <Text className="text-4xl font-black mb-1">{averageRating.toFixed(1)}</Text>
          <View className="flex-row gap-0.5">
            {Array.from({ length: fullStars }).map((_, i) => (
              <Ionicons key={`f-${i}`} name="star" size={12} color={theme.primary} />
            ))}
            {hasHalf && <Ionicons name="star-half" size={12} color={theme.primary} />}
            {Array.from({ length: 5 - fullStars - (hasHalf ? 1 : 0) }).map((_, i) => (
              <Ionicons key={`e-${i}`} name="star-outline" size={12} color={theme.primary} />
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
              <Text className="w-5 text-[11px] text-muted-foreground">{count}</Text>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}

function ReviewCard({
  item,
  theme,
  isOwn,
  onEdit,
}: {
  item: WorkshopReviewResponse;
  theme: typeof THEME.light;
  isOwn: boolean;
  onEdit?: () => void;
}) {
  const avatarUri = item.user.avatarUrl ?? undefined;

  return (
    <Card className="rounded-2xl py-4 mx-4 mb-3">
      <CardContent className="gap-3 px-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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

          {/* Own review → edit button; others → report */}
          {isOwn ? (
            <TouchableOpacity
              className="p-1"
              onPress={onEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="pencil-outline" size={16} color={theme.primary} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="p-1"
              onPress={() => Alert.alert('Report', 'Report this review as inappropriate?')}>
              <Ionicons name="ellipsis-vertical" size={16} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <StarRow rating={item.rating} />

        {!!item.comment && (
          <Text className="text-sm leading-6 text-muted-foreground">{item.comment}</Text>
        )}

        {item.imageUrls.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-1">
            {item.imageUrls.map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={{ width: 72, height: 72, borderRadius: 8 }}
                resizeMode="cover"
              />
            ))}
          </View>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────

export default function WorkshopAllReviewsScreen({ navigation, route }: Props) {
  const { workshopId, workshopName, averageRating: initialAvg, totalRatings: initialTotal } = route.params;
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { user } = useAuth();

  // Live workshop detail — refetched automatically after any review mutation
  const { data: workshop } = useWorkshopDetail(workshopId);
  const averageRating = workshop?.averageRating ?? initialAvg;
  const totalRatings = workshop?.totalRatings ?? initialTotal;

  const [activeSort, setActiveSort] = useState<ReviewSortKey>('createdAt,desc');
  const [activeStar, setActiveStar] = useState<FilterStar>(0);
  const [showModal, setShowModal] = useState(false);

  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useWorkshopReviews(workshopId, activeSort);

  const createReviewMutation = useCreateWorkshopReview(workshopId);
  const updateReviewMutation = useUpdateWorkshopReview(workshopId);

  // Flatten all pages into a single list
  const allReviews = useMemo(
    () => data?.pages.flatMap((page) => page.content) ?? [],
    [data]
  );

  // Detect the current user's own review (if any)
  const myReview: WorkshopReviewResponse | undefined = useMemo(
    () => (user ? allReviews.find((r) => r.user.id === user.id) : undefined),
    [allReviews, user]
  );

  // Client-side star filter
  const displayedReviews = useMemo(
    () => (activeStar === 0 ? allReviews : allReviews.filter((r) => r.rating === activeStar)),
    [allReviews, activeStar]
  );

  // Compute bar counts from loaded reviews (5→4→3→2→1)
  const barCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of allReviews) {
      if (r.rating >= 1 && r.rating <= 5) counts[5 - r.rating]++;
    }
    return counts;
  }, [allReviews]);

  const handleSubmitReview = async (rating: number, text: string): Promise<void> => {
    if (myReview) {
      await updateReviewMutation.mutateAsync({
        reviewId: myReview.id,
        request: { rating, comment: text },
      });
    } else {
      await createReviewMutation.mutateAsync({
        workshopTemplateId: workshopId,
        rating,
        comment: text,
      });
    }
  };

  // Ref guard: prevent onEndReached from firing while a fetch is already in
  // progress. This is a last line of defence in case hasNextPage is stale.
  const isFetchingRef = useRef(false);
  isFetchingRef.current = isFetchingNextPage || isFetching;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingRef.current) {
      fetchNextPage();
    }
  };

  const ListHeader = (
    <View>
      <RatingSummaryBar
        averageRating={averageRating}
        totalRatings={totalRatings}
        barCounts={barCounts}
        theme={theme}
      />

      {/* Sort chips */}
      <View className="px-4 mb-2">
        <FlatList
          data={SORT_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveSort(item.value)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: activeSort === item.value ? theme.primary : theme.muted,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: activeSort === item.value ? '#fff' : theme.mutedForeground,
                }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Star filter chips */}
      <View className="px-4 mb-4">
        <FlatList
          data={[...FILTER_STARS]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveStar(item as FilterStar)}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 20,
                backgroundColor: activeStar === item ? theme.primary : theme.muted,
              }}>
              {item === 0 ? (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: activeStar === 0 ? '#fff' : theme.mutedForeground,
                  }}>
                  All
                </Text>
              ) : (
                <>
                  <Ionicons
                    name="star"
                    size={11}
                    color={activeStar === item ? '#fff' : '#f97316'}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: activeStar === item ? '#fff' : theme.mutedForeground,
                    }}>
                    {item}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Error / empty states */}
      {error && (
        <View className="items-center py-10 gap-2 mx-4">
          <Ionicons name="cloud-offline-outline" size={36} color={theme.mutedForeground} />
          <Text style={{ color: theme.mutedForeground, fontSize: 13, textAlign: 'center' }}>
            Could not load reviews. Pull down to retry.
          </Text>
        </View>
      )}

      {!isLoading && !error && displayedReviews.length === 0 && (
        <View className="items-center py-16 gap-3">
          <Ionicons name="chatbubble-outline" size={40} color={theme.mutedForeground} />
          <Text style={{ color: theme.mutedForeground, fontSize: 14 }}>
            {activeStar === 0 ? 'No reviews yet. Be the first!' : 'No reviews for this rating.'}
          </Text>
        </View>
      )}
    </View>
  );

  const ListFooter = isFetchingNextPage ? (
    <View className="items-center py-6">
      <ActivityIndicator size="small" color={theme.primary} />
    </View>
  ) : null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between border-b px-4 py-3"
        style={{ borderColor: theme.border }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 p-2">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text className="flex-1 ml-2 text-lg font-bold" style={{ color: theme.foreground }}>
          Reviews
        </Text>
        {user && (
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: theme.primary,
            }}>
            <Ionicons name={myReview ? 'pencil-outline' : 'create-outline'} size={15} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
              {myReview ? 'Edit' : 'Write'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.mutedForeground, fontSize: 13 }}>Loading reviews…</Text>
        </View>
      ) : (
        <FlatList
          data={displayedReviews}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          renderItem={({ item }) => (
            <ReviewCard
              item={item}
              theme={theme}
              isOwn={item.user.id === user?.id}
              onEdit={() => setShowModal(true)}
            />
          )}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
        />
      )}

      <WriteReviewModal
        visible={showModal}
        workshopName={workshopName}
        initialRating={myReview?.rating}
        initialText={myReview?.comment}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitReview}
      />
    </SafeAreaView>
  );
}
