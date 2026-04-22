import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type FullScreenErrorProps = {
  /** Error message shown to the user. */
  message?: string;
  /** Async callback invoked on pull-to-refresh *or* pressing the retry button. */
  onRetry?: () => Promise<unknown>;
  /** Hide the back button (e.g. for root-level screens). Defaults to false. */
  hideBack?: boolean;
  /** Custom back handler. Falls back to `navigation.goBack()`. */
  onBack?: () => void;
};

/**
 * A full-screen error state that mirrors `FullScreenLoader` styling.
 *
 * Supports:
 * - An optional **back button** (same ghost style / position as `FullScreenLoader`)
 * - **Pull-to-refresh** – the user can swipe down to retry
 * - A **Retry** button for an explicit tap-to-retry action
 *
 * @example
 * ```tsx
 * if (isError) {
 *   return <FullScreenError message="Could not load data." onRetry={() => refetch()} />;
 * }
 * ```
 */
export default function FullScreenError({
  message,
  onRetry,
  hideBack = false,
  onBack,
}: FullScreenErrorProps) {
  const { t } = useTranslation();
  const defaultMessage = t('common.error_default');
  const displayMessage = message ?? defaultMessage;
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;
    setRefreshing(true);
    try {
      await onRetry();
    } finally {
      setRefreshing(false);
    }
  }, [onRetry]);

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Back button */}
      {!hideBack && (
        <View style={{ paddingTop: insets.top + 8, paddingLeft: 16 }}>
          <Button
            variant="ghost"
            size="icon"
            onPress={handleBack}
            accessibilityLabel="Go back"
            className="h-10 w-10 rounded-full">
            <Ionicons name="arrow-back" size={22} color={theme.foreground} />
          </Button>
        </View>
      )}

      {/* Scrollable area for pull-to-refresh */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-1 items-center justify-center px-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRetry ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRetry}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          ) : undefined
        }>
        {/* Icon */}
        <View
          className="mb-5 items-center justify-center rounded-full"
          style={{
            width: 64,
            height: 64,
            backgroundColor: isDarkColorScheme
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(239, 68, 68, 0.1)',
          }}>
          <Ionicons name="alert-circle-outline" size={32} color={theme.destructive} />
        </View>

        {/* Message */}
        <Text
          className="text-center text-base font-medium"
          style={{ color: theme.foreground }}>
          {t('common.oops')}
        </Text>
        <Text
          className="mt-2 text-center text-sm"
          style={{ color: theme.mutedForeground }}>
          {displayMessage}
        </Text>

        {/* Retry button */}
        {onRetry && (
          <Button
            variant="outline"
            onPress={handleRetry}
            disabled={refreshing}
            className="mt-6 flex-row items-center gap-2"
            style={{ borderColor: theme.border }}>
            <Ionicons name="refresh-outline" size={16} color={theme.primary} />
            <Text style={{ color: theme.primary }} className="text-sm font-medium">
              {t('common.retry')}
            </Text>
          </Button>
        )}

        {/* Pull-down hint */}
        {onRetry && (
          <Text
            className="mt-4 text-center text-xs"
            style={{ color: theme.mutedForeground }}>
            {t('common.pull_to_refresh')}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
