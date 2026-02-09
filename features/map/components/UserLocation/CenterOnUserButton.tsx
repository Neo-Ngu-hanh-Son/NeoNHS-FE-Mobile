import React from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

interface CenterOnUserButtonProps {
  /** Callback when button is pressed */
  onPress: () => void;
  /** Whether location is currently being fetched */
  isLoading?: boolean;
  /** Whether user location is available */
  hasLocation?: boolean;
  /** Whether location tracking is active */
  isTracking?: boolean;
}

/**
 * Floating action button to center the map on user's location
 * Shows different states:
 * - Loading: spinning indicator
 * - No location: crosshairs icon (gray)
 * - Has location: crosshairs icon (blue)
 * - Tracking: filled location icon
 */
export default function CenterOnUserButton({
  onPress,
  isLoading = false,
  hasLocation = false,
  isTracking = false,
}: CenterOnUserButtonProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const getIconName = (): keyof typeof MaterialIcons.glyphMap => {
    if (isTracking) {
      return 'my-location';
    }
    return 'location-searching';
  };

  const getIconColor = (): string => {
    if (!hasLocation) {
      return theme.muted;
    }
    return '#4285F4'; // Google Maps blue
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <MaterialIcons name={getIconName()} size={24} color={getIconColor()} />
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
