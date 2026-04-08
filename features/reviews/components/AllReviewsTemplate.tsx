import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useAuth } from '@/features/auth';

import { RatingSummary } from './RatingSummary';
import { ReviewCard } from './ReviewCard';
import { WriteReviewSheet, WriteReviewSheetRef } from './WriteReviewSheet';
import type { Review } from '../types';

export interface AllReviewsTemplateProps {
  targetName: string;
  averageRating: number;
  totalRatings: number;
  reviews: Review[];
  myReview?: Review;
  isLoading: boolean;
  isFetching: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  error: unknown;
  activeSort: string;
  onSortChange: (sort: string) => void;
  sortOptions: { label: string; value: string }[];
  onLoadMore: () => void;
  onSubmitReview: (rating: number, text: string) => Promise<void>;
  onGoBack: () => void;
}

const FILTER_STARS = [0, 5, 4, 3, 2, 1] as const;
type FilterStar = (typeof FILTER_STARS)[number];

export function AllReviewsTemplate({
  targetName,
  averageRating,
  totalRatings,
  reviews,
  myReview,
  isLoading,
  isFetching,
  isFetchingNextPage,
  hasNextPage,
  error,
  activeSort,
  onSortChange,
  sortOptions,
  onLoadMore,
  onSubmitReview,
  onGoBack,
}: AllReviewsTemplateProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { user } = useAuth();

  const sheetRef = useRef<WriteReviewSheetRef>(null);
  const [activeStar, setActiveStar] = useState<FilterStar>(0);

  // Client-side star filter
  const displayedReviews = useMemo(
    () => (activeStar === 0 ? reviews : reviews.filter((r) => r.rating === activeStar)),
    [reviews, activeStar]
  );

  // Compute bar counts from loaded reviews (5→4→3→2→1)
  const barCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const r of reviews) {
      if (r.rating >= 1 && r.rating <= 5) counts[5 - r.rating]++;
    }
    return counts;
  }, [reviews]);

  // Ref guard: prevent onEndReached from firing while a fetch is already in
  // progress. This is a last line of defence in case hasNextPage is stale.
  const isFetchingRef = useRef(false);
  isFetchingRef.current = isFetchingNextPage || isFetching;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingRef.current) {
      onLoadMore();
    }
  };

  const ListHeader = (
    <View>
      <View className="px-4 pt-4 pb-2">
        <RatingSummary
          averageRating={averageRating}
          totalRatings={totalRatings}
          barCounts={barCounts}
        />
      </View>

      {/* Sort chips */}
      {sortOptions.length > 0 && (
        <View className="px-4 mb-2">
          <FlatList<{ label: string; value: string }>
            data={sortOptions}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.value}
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSortChange(item.value)}
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
      )}

      {/* Star filter chips */}
      <View className="px-4 mb-4">
        <FlatList<FilterStar>
          data={[...FILTER_STARS]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item)}
          contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveStar(item)}
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

      {/* Error / empty states — use Boolean() so `unknown` is not a direct React child */}
      {!!error && (
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
        <TouchableOpacity onPress={onGoBack} className="-ml-2 p-2">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text className="flex-1 ml-2 text-lg font-bold" style={{ color: theme.foreground }}>
          Reviews
        </Text>
        {user && (
          <TouchableOpacity
            onPress={() => sheetRef.current?.present()}
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
            <View className="px-4 mb-3">
              <ReviewCard
                item={item}
                isOwn={item.user.id === user?.id}
                onEdit={() => sheetRef.current?.present()}
                onReport={() => Alert.alert('Report', 'Report this review as inappropriate?')}
              />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 0, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
        />
      )}

      <WriteReviewSheet
        ref={sheetRef}
        targetName={targetName}
        initialRating={myReview?.rating}
        initialText={myReview?.comment ?? ''}
        onSubmit={onSubmitReview}
      />
    </SafeAreaView>
  );
}
