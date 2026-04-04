import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { getManeuverPresentation } from '../../helpers';
import type { NavigationGuideOverlayProps } from './types';

type ActiveNavigationOverlayProps = Omit<NavigationGuideOverlayProps, 'visible' | 'isUserArrived'>;

export default function ActiveNavigationOverlay({
  isLoading,
  isReady,
  errorMessage,
  travelModeLabel,
  onOpenSteps,
  currentNavigationStepData,
  onExit,
}: ActiveNavigationOverlayProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const statusTitle = isLoading ? 'Preparing route...' : isReady ? 'Route ready' : 'Waiting for navigation data...';
  const statusSubtitle =
    errorMessage ??
    (isLoading
      ? 'Fetching directions from your current location'
      : isReady
        ? 'Follow the route on the map'
        : 'Fetching route data...');

  const hasActiveInstruction = isReady && !!currentNavigationStepData?.currentInstructionText;
  const maneuverPresentation = getManeuverPresentation(currentNavigationStepData?.currentManeuver);
  const topCardTitle = hasActiveInstruction ? currentNavigationStepData?.currentInstructionText : statusTitle;

  let topCardSubtitle = statusSubtitle;
  if (hasActiveInstruction) {
    const stepMeta = [
      currentNavigationStepData?.currentStepProgressText,
      currentNavigationStepData?.currentStepDistanceText,
      currentNavigationStepData?.currentStepDurationText,
    ].filter(Boolean);
    topCardSubtitle = `${maneuverPresentation.label}${stepMeta.length > 0 ? ` · ${stepMeta.join(' · ')}` : ''}`;
  }

  return (
    <>
      {/* ── Top card: current instruction / status ── */}
      <SafeAreaView pointerEvents="box-none" className="absolute left-0 right-0 top-2 px-3" edges={['top']}>
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
                <Ionicons
                  name={
                    (hasActiveInstruction
                      ? maneuverPresentation.iconName
                      : isReady
                        ? 'navigate'
                        : 'warning-outline') as React.ComponentProps<typeof Ionicons>['name']
                  }
                  size={20}
                  color="#ffffff"
                />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-white">{topCardTitle}</Text>
              <Text className="text-xs text-white/90">{topCardSubtitle}</Text>
            </View>

            <TouchableOpacity
              onPress={onOpenSteps}
              className={`rounded-full bg-white/10 px-3 py-1`}
              accessibilityRole="button"
              accessibilityLabel="Open navigation steps">
              <Text className={`text-xs font-semibold text-white/70`}>Steps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* ── Bottom card: trip summary + exit ── */}
      <View pointerEvents="box-none" className="absolute bottom-4 left-0 right-0 px-3">
        <View
          className="rounded-3xl px-4 py-3"
          style={{
            backgroundColor: isDarkColorScheme ? 'rgba(18,18,18,0.95)' : 'rgba(17,24,39,0.92)',
          }}>
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-base font-bold text-white">
                {currentNavigationStepData?.tripDurationText ?? (isLoading ? 'Calculating...' : 'Navigation')}
                {currentNavigationStepData?.tripDistanceText ? ` (${currentNavigationStepData?.tripDistanceText})` : ''}
              </Text>
              <Text className="text-xs text-white/80">
                {isReady
                  ? `${travelModeLabel ?? 'Walking'} to destination`
                  : isLoading
                    ? 'Please wait while route loads'
                    : 'No active route'}
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

      {/* ── Inline error banner ── */}
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
