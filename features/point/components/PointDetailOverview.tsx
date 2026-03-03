import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../../map/types';

type PointDetailOverviewProps = {
  point: MapPoint;
  isReadMore: boolean;
  onToggleReadMore: () => void;
};

export function PointDetailOverview({
  point,
  isReadMore,
  onToggleReadMore,
}: PointDetailOverviewProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <View className="gap-3">
      <Text className="text-xl font-black tracking-tight">Overview</Text>
      <Text className="text-[15px] leading-7 text-muted-foreground">
        {point.description || 'No description available.'}
        {isReadMore && point.history && (
          <Text className="text-[15px] leading-7 text-muted-foreground">
            {'\n\n'}
            {point.history}
          </Text>
        )}
      </Text>

      {/* Read more / Read less toggle */}
      {point.history && (
        <Button variant="link" onPress={onToggleReadMore} className="self-start px-0">
          <Text className="text-sm font-bold" style={{ color: theme.primary }}>
            {isReadMore ? 'Show less' : 'Read about history'}
          </Text>
        </Button>
      )}
    </View>
  );
}
