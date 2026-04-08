import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

export interface RatingSummaryProps {
  averageRating: number;
  totalRatings: number;
  /** Counts for stars 5→4→3→2→1 (index 0 = 5-star, index 4 = 1-star) */
  barCounts: number[];
}

export function RatingSummary({ averageRating, totalRatings, barCounts }: RatingSummaryProps) {
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
