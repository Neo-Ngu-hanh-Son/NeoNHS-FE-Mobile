import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { LocationPermissionStatus } from '../../hooks/useUserLocation';

interface LocationPermissionBannerProps {
  /** Current permission status */
  permissionStatus: LocationPermissionStatus;
  /** Callback when user taps to request permission */
  onRequestPermission: () => void;
  /** Error message to display (optional) */
  error?: string | null;
}

/**
 * Banner component that shows when location permission is needed
 * or when there's an error with location services
 */
export default function LocationPermissionBanner({
  permissionStatus,
  onRequestPermission,
  error,
}: LocationPermissionBannerProps) {
  const { isDarkColorScheme } = useTheme();

  // Don't show if permission is granted and no error
  if (permissionStatus === 'granted' && !error) {
    return null;
  }

  const getMessage = (): string => {
    if (error) {
      return error;
    }
    if (permissionStatus === 'denied') {
      return 'Location access denied. Enable in settings to see your location.';
    }
    return 'Tap to enable location tracking';
  };

  const getIcon = (): keyof typeof MaterialIcons.glyphMap => {
    if (error || permissionStatus === 'denied') {
      return 'location-off';
    }
    return 'location-searching';
  };

  const getBackgroundColor = (): string => {
    if (error || permissionStatus === 'denied') {
      return isDarkColorScheme ? '#7f1d1d' : '#fef2f2';
    }
    return isDarkColorScheme ? '#1e3a5f' : '#eff6ff';
  };

  const getBorderColor = (): string => {
    if (error || permissionStatus === 'denied') {
      return isDarkColorScheme ? '#b91c1c' : '#fecaca';
    }
    return isDarkColorScheme ? '#3b82f6' : '#bfdbfe';
  };

  const getTextColor = (): string => {
    if (error || permissionStatus === 'denied') {
      return isDarkColorScheme ? '#fecaca' : '#991b1b';
    }
    return isDarkColorScheme ? '#93c5fd' : '#1e40af';
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
      onPress={onRequestPermission}
    >
      <MaterialIcons name={getIcon()} size={20} color={getTextColor()} />
      <Text style={[styles.text, { color: getTextColor() }]} numberOfLines={2}>
        {getMessage()}
      </Text>
      {permissionStatus !== 'denied' && (
        <MaterialIcons name="chevron-right" size={20} color={getTextColor()} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
