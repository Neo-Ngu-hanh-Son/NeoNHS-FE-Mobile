import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MapPoint } from '../../map/types';
import { useTranslation } from 'react-i18next';

type PointDetailOverviewProps = {
  point: MapPoint;
};

export function PointDetailOverview({ point }: PointDetailOverviewProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { t } = useTranslation();

  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const CHAR_LIMIT = 200;

  // Helper to handle text truncation logic
  const renderTruncatedText = (
    text: string | undefined,
    isExpanded: boolean,
    toggleFn: () => void,
    labelMore: string,
    labelLess: string
  ) => {
    if (!text) return <Text className="text-[15px] text-muted-foreground">{t('point.no_description')}</Text>;

    const shouldTruncate = text.length > CHAR_LIMIT;
    const displayText = isExpanded || !shouldTruncate
      ? text
      : `${text.substring(0, CHAR_LIMIT)}...`;

    return (
      <View>
        <Text className="text-[15px] leading-7 text-muted-foreground">
          {displayText}
        </Text>
        {shouldTruncate && (
          <Button variant="link" onPress={toggleFn} className="self-start px-0 h-auto mt-1">
            <Text className="text-sm font-bold" style={{ color: theme.primary }}>
              {isExpanded ? labelLess : labelMore}
            </Text>
          </Button>
        )}
      </View>
    );
  };

  return (
    <View className="gap-6">
      {/* Overview Section */}
      <View className="gap-2">
        <Text className="text-xl font-black tracking-tight">{t('point.tabs.overview')}</Text>
        {renderTruncatedText(
          point.description,
          isOverviewExpanded,
          () => setIsOverviewExpanded(!isOverviewExpanded),
          t('point.read_more'),
          t('point.show_less')
        )}
      </View>

      {/* History Section */}
      {point.history && (
        <View className="gap-2">
          <Text className="text-xl font-black tracking-tight">{t('point.tabs.history')}</Text>
          {renderTruncatedText(
            point.history,
            isHistoryExpanded,
            () => setIsHistoryExpanded(!isHistoryExpanded),
            t('point.read_more'),
            t('point.show_less')
          )}
        </View>
      )}
    </View>
  );
}