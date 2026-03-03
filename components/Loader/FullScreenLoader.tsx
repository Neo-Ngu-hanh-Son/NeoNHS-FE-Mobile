import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type FullScreenLoaderProps = {
  message?: string;
  /** Hide the back button (e.g. for root-level screens). Defaults to false. */
  hideBack?: boolean;
  /** Custom back handler. Falls back to navigation.goBack(). */
  onBack?: () => void;
};

export default function FullScreenLoader({
  message = 'Loading…',
  hideBack = false,
  onBack,
}: FullScreenLoaderProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

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

      {/* Centered spinner + text */}
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={theme.primary} />
        {message ? (
          <Text className="mt-4 text-sm" style={{ color: theme.mutedForeground }}>
            {message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
