import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type NavigationGuideOverlayProps = {
  visible: boolean;
  isLoading: boolean;
  isReady: boolean;
  errorMessage?: string | null;
  durationText?: string;
  distanceText?: string;
  onExit: () => void;
};

export default function NavigationGuideOverlay({
  visible,
  isLoading,
  isReady,
  errorMessage,
  durationText,
  distanceText,
  onExit,
}: NavigationGuideOverlayProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  if (!visible) {
    return null;
  }

  const statusTitle = isLoading ? 'Preparing route...' : isReady ? 'Route ready' : 'Navigation unavailable';
  const statusSubtitle =
    errorMessage ??
    (isLoading
      ? 'Fetching directions from your current location'
      : isReady
        ? 'Follow the route on the map'
        : 'Unable to load route guidance');

  return (
    <>
      <SafeAreaView pointerEvents="box-none" className="absolute left-0 right-0 top-0 px-3" edges={['top']}>
        <View
          className="rounded-3xl px-4 py-3"
          style={{
            backgroundColor: isReady ? '#1f7a45' : errorMessage ? '#7f1d1d' : '#166534',
          }}>
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-white/15">
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Ionicons name={isReady ? 'navigate' : 'warning-outline'} size={20} color="#ffffff" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-white">{statusTitle}</Text>
              <Text className="text-xs text-white/90">{statusSubtitle}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <View pointerEvents="box-none" className="absolute bottom-4 left-0 right-0 px-3">
        <View
          className="rounded-3xl px-4 py-3"
          style={{
            backgroundColor: isDarkColorScheme ? 'rgba(18,18,18,0.95)' : 'rgba(17,24,39,0.92)',
          }}>
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-base font-bold text-white">
                {durationText ?? (isLoading ? 'Calculating...' : 'Navigation')}
                {distanceText ? ` (${distanceText})` : ''}
              </Text>
              <Text className="text-xs text-white/80">
                {isReady ? 'Walking to destination' : isLoading ? 'Please wait while route loads' : 'No active route'}
              </Text>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Exit navigation guidance"
              activeOpacity={0.85}
              onPress={onExit}
              className="flex-row items-center gap-2 rounded-full px-4 py-2"
              style={{ backgroundColor: '#b91c1c' }}>
              <Ionicons name="close" size={16} color="#ffffff" />
              <Text className="text-sm font-semibold text-white">Exit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {!isLoading && errorMessage ? (
        <View
          pointerEvents="none"
          className="absolute left-4 right-4 rounded-xl border px-3 py-2"
          style={{
            bottom: 104,
            borderColor: theme.border,
            backgroundColor: isDarkColorScheme ? 'rgba(30,41,59,0.92)' : 'rgba(255,255,255,0.95)',
          }}>
          <Text className="text-xs" style={{ color: theme.foreground }}>
            {errorMessage}
          </Text>
        </View>
      ) : null}
    </>
  );
}
