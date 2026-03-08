import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Button } from '../ui/button';
import { Text } from '../ui/text';

type RefreshableScreenLayoutProps = {
  /** Content to render inside the scrollable area */
  children: React.ReactNode;
  /** Async callback invoked when the user pulls to refresh (e.g. `() => refetch()`) */
  onRefresh: () => Promise<unknown>;
  /** Whether to show the floating back button. Defaults to `false`. */
  showBackButton?: boolean;
  /** Custom back handler. Falls back to `navigation.goBack()`. */
  onBack?: () => void;
  /** Extra style applied to the outer SafeAreaView container */
  style?: StyleProp<ViewStyle>;
  /** Style applied to the ScrollView content container */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Extra className applied to the ScrollView content container */
  contentContainerClassName?: string;
  /** Which safe-area edges to respect. Defaults to `['top']`. */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  /** Whether to show the vertical scroll indicator. Defaults to `false`. */
  showsVerticalScrollIndicator?: boolean;
  /** Extra className applied to the ScrollView */
  scrollViewClassName?: string;
  /** Perfectly centered title that does not count the back button */
  title?: string;
};

/**
 * A screen-level wrapper that combines `ScreenLayout` (safe area + floating
 * back button) with a pull-to-refresh `ScrollView`.
 *
 * Children are rendered inside a `ScrollView` that has a `RefreshControl`
 * wired up to the supplied `onRefresh` callback, so any screen can enable
 * swipe-down refresh by simply passing `() => refetch()`.
 *
 * @example
 * ```tsx
 * const { data, refetch } = useQuery({ ... });
 *
 * return (
 *   <RefreshableScreenLayout
 *     showBackButton
 *     onRefresh={() => refetch()}
 *     contentContainerClassName="p-5 pb-10"
 *   >
 *     <MyContent data={data} />
 *   </RefreshableScreenLayout>
 * );
 * ```
 */
export function RefreshableScreenLayout({
  children,
  onRefresh,
  showBackButton = false,
  onBack,
  style,
  contentContainerStyle,
  contentContainerClassName,
  edges = ['top'],
  showsVerticalScrollIndicator = false,
  scrollViewClassName = 'flex-1',
  title,
}: RefreshableScreenLayoutProps) {
  const navigation = useNavigation();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }, style]}
      edges={edges}>
      <ScrollView
        className={scrollViewClassName}
        contentContainerStyle={contentContainerStyle}
        contentContainerClassName={contentContainerClassName}
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

      {title && (
        <View
          style={{ top: insets.top + 12 }}
          className="pointer-events-none absolute left-0 right-0 h-10 items-center justify-center">
          <Text className="text-xl font-bold text-foreground">{title}</Text>
        </View>
      )}

      {showBackButton && (
        <Button
          className="transition-all duration-200 active:scale-95 active:bg-secondary/80 dark:active:bg-secondary/30"
          variant={'outline'}
          size={'icon'}
          style={[
            styles.backButton,
            {
              top: insets.top + 12,
              borderColor: theme.border,
            },
          ]}
          onPress={handleBack}
          accessibilityLabel="Go back"
          accessibilityRole="button">
          <Ionicons name="arrow-back" size={22} color={theme.foreground} />
        </Button>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 999,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

export default RefreshableScreenLayout;
