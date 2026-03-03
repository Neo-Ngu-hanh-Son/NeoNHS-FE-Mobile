import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

/* ─── Rating Summary ─── */

function RatingSummary() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <Card className="rounded-2xl py-5">
      <CardContent className="flex-row items-center gap-6 px-5">
        {/* Score */}
        <View className="items-center">
          <Text className="mb-1 text-4xl font-black">4.8</Text>
          <View className="flex-row gap-0.5">
            {[1, 2, 3, 4].map((i) => (
              <Ionicons key={i} name="star" size={12} color={theme.primary} />
            ))}
            <Ionicons name="star-half" size={12} color={theme.primary} />
          </View>
          <Text className="mt-1.5 text-[11px] text-muted-foreground">324 reviews</Text>
        </View>

        {/* Bar chart */}
        <View className="flex-1 gap-1.5">
          {[85, 10, 2, 1, 2].map((percent, i) => (
            <View key={i} className="flex-row items-center gap-2">
              <Text className="w-3 text-right text-[11px] text-muted-foreground">{5 - i}</Text>
              <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <View className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </View>
            </View>
          ))}
        </View>
      </CardContent>
    </Card>
  );
}

/* ─── Single Review Card ─── */

function ReviewCard() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <Card className="rounded-2xl py-4">
      <CardContent className="gap-3 px-4">
        {/* Author row */}
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyA0J5rjp-aat59aZlP_WPjj2erMvBLSVc3jMNbe2unFO_xI0RXTo7kfksioeO335FoVJHhTzY5ACTZKVFHxXj2J1-190VmStf7Z5nZF99bv-kFmgd7-KKn02qB_mvBya6bARq9ILUymtkP1dEuQvBUxC2HWNVmmv8hnucAalFtRq3KfhaLuRpVGGnoCzPfCkrHfO_IlgghxAGez_M-m6TIrMMatVy7I838qCmfBm_Weznr7MqF8Pr-BuL5pSj5Yuwt_y-2Muv82bD',
              }}
              className="h-10 w-10 rounded-full"
              resizeMode="cover"
            />
            <View>
              <Text className="text-sm font-bold">Sarah Jenkins</Text>
              <Text className="text-[11px] text-muted-foreground">2 days ago</Text>
            </View>
          </View>
          <TouchableOpacity className="p-1">
            <Ionicons name="ellipsis-vertical" size={16} color={theme.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Stars */}
        <View className="flex-row gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons key={i} name="star" size={12} color="#f97316" />
          ))}
        </View>

        {/* Review text */}
        <Text className="text-sm leading-6 text-muted-foreground">
          Absolutely stunning views! The hike was moderate but well worth it. Make sure to bring bug
          spray though.
        </Text>
      </CardContent>
    </Card>
  );
}

/* ─── Reviews Section ─── */

export function PointDetailReviews() {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <View className="gap-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text className="text-xl font-black tracking-tight">Reviews</Text>
        <TouchableOpacity className="flex-row items-center gap-1" activeOpacity={0.7}>
          <Text className="text-sm font-bold" style={{ color: theme.primary }}>
            Write a review
          </Text>
          <Ionicons name="arrow-forward" size={14} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Rating summary */}
      <RatingSummary />

      {/* Sample review */}
      <ReviewCard />

      {/* View all link */}
      <TouchableOpacity
        className="flex-row items-center justify-center gap-1 py-1"
        activeOpacity={0.7}>
        <Text className="text-sm font-bold" style={{ color: theme.primary }}>
          View all reviews
        </Text>
        <Ionicons name="arrow-forward" size={14} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );
}
