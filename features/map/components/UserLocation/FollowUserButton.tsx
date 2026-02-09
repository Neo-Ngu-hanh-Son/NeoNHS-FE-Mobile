import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { logger } from '@/utils/logger';

interface FollowUserButtonProps {
  /** Callback when button is pressed */
  onPress: () => void;
  /** Whether location is currently being fetched */
  isLoading?: boolean;
  /** Whether user location is available */
  hasLocation?: boolean;
  /** Whether the map is currently following the user */
  isFollowing?: boolean;
}

/**
 * Floating action button to toggle follow user mode
 * Shows different states:
 * - Loading: spinning indicator
 * - No location: navigation icon (gray)
 * - Has location but not following: navigation icon (blue outline)
 * - Following: filled navigation icon (blue)
 */
export default function FollowUserButton({
  onPress,
  isLoading = false,
  hasLocation = false,
  isFollowing = false,
}: FollowUserButtonProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const getIconName = (): keyof typeof MaterialCommunityIcons.glyphMap => {
    if (isFollowing) {
      return 'navigation-variant'; // Filled navigation icon when following
    }
    return 'navigation-variant-outline'; // Outline navigation icon when not following
  };

  const getIconColor = (): string => {
    if (!hasLocation) {
      return theme.mutedForeground;
    }
    return '#4285F4'; // Google Maps blue
  };

  const getBackgroundColor = (): string => {
    return theme.card;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: isFollowing ? '#4285F4' : theme.border,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
      onPress={onPress}
      disabled={isLoading || !hasLocation}>
      {isLoading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <MaterialCommunityIcons name={getIconName()} size={24} color={getIconColor()} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
