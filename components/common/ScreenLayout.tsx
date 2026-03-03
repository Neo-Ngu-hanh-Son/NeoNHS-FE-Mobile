import React from 'react';
import { StyleSheet, TouchableOpacity, type ViewStyle, type StyleProp } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Button } from '../ui/button';

type ScreenLayoutProps = {
  /** Content to render inside the layout */
  children: React.ReactNode;
  /** Whether to show the floating back button. Defaults to `false`. */
  showBackButton?: boolean;
  /** Custom back handler. Falls back to `navigation.goBack()`. */
  onBack?: () => void;
  /** Extra style applied to the outer SafeAreaView container */
  style?: StyleProp<ViewStyle>;
  /** Which safe-area edges to respect. Defaults to `['top']`. */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

/**
 * A reusable screen wrapper that optionally renders a floating back button
 * in the top-left corner.  Use `showBackButton` to toggle its visibility.
 * Also, this screen layout use safe area insets (top) to position the back button.
 *
 * @example
 * ```tsx
 * <ScreenLayout showBackButton={!!route.params?.pointId}>
 *   <NHSMap … />
 * </ScreenLayout>
 * ```
 */
export function ScreenLayout({
  children,
  showBackButton = false,
  onBack,
  style,
  edges = ['top'],
}: ScreenLayoutProps) {
  const navigation = useNavigation();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();

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
      {children}

      {showBackButton && (
        <Button
          className="transition-all duration-200 active:bg-transparent"
          variant={'outline'}
          size={'icon'}
          style={[
            styles.backButton,
            {
              top: insets.top + 12,
              backgroundColor: theme.background,
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
    zIndex: 999, // Ensure it renders above MapView
    elevation: 10, // Must be high enough to beat the native MapView layer on Android
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});

export default ScreenLayout;
