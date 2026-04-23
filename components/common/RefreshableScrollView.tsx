import React, { useCallback, useState } from 'react';
import { ScrollView, RefreshControl, type ViewStyle, type StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type RefreshableScrollViewProps = {
  /** Content to render inside the scrollable area */
  children: React.ReactNode;
  /** Async function(s) to call when the user pulls to refresh */
  onRefresh: () => Promise<unknown>;
  /** Style applied to the outer SafeAreaView */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the ScrollView content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Which safe-area edges to respect. Defaults to `['top']`. */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Whether to show the vertical scroll indicator. Defaults to `false`. */
  showsVerticalScrollIndicator?: boolean;
  /** Extra className applied to the ScrollView */
  scrollViewClassName?: string;
};

/**
 * A reusable screen wrapper with pull-to-refresh built in.
 *
 * Any screen that needs swipe-down-to-reload simply passes an `onRefresh`
 * callback that returns a Promise (e.g. a TanStack Query `refetch()`).
 *
 * @example
 * ```tsx
 * <RefreshableScrollView onRefresh={() => refetch()}>
 *   <MyContent />
 * </RefreshableScrollView>
 * ```
 */
export function RefreshableScrollView({
  children,
  onRefresh,
  style,
  contentContainerStyle,
  edges = ['top'],
  showsVerticalScrollIndicator = false,
  scrollViewClassName = 'flex-1',
}: RefreshableScrollViewProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: theme.background }, style]} edges={edges}>
      <ScrollView
        className={scrollViewClassName}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export default RefreshableScrollView;
