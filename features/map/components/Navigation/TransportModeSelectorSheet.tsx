import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { TravelMode } from '../../types';

type TransportModeSelectorSheetProps = {
  visible: boolean;
  selectedMode: TravelMode;
  destinationName?: string;
  previewDistanceText?: string;
  previewDurationText?: string;
  isLoading: boolean;
  errorMessage?: string | null;
  canStartNavigation: boolean;
  onSelectMode: (mode: TravelMode) => void;
  onStartNavigation: () => void;
  onCancel: () => void;
};

type ModeOption = {
  mode: TravelMode;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'WALK',
    label: 'Walk',
    description: 'Pedestrian routes',
    icon: 'walk-outline',
  },
  {
    mode: 'DRIVE',
    label: 'Drive',
    description: 'Car-friendly roads',
    icon: 'car-outline',
  },
  {
    mode: 'BICYCLE',
    label: 'Bicycle',
    description: 'Cycle-friendly route',
    icon: 'bicycle-outline',
  },
  {
    mode: 'TWO_WHEELER',
    label: 'Motorbike',
    description: 'Two-wheeler route',
    icon: 'speedometer-outline',
  },
];

export default function TransportModeSelectorSheet({
  visible,
  selectedMode,
  destinationName,
  previewDistanceText,
  previewDurationText,
  isLoading,
  errorMessage,
  canStartNavigation,
  onSelectMode,
  onStartNavigation,
  onCancel,
}: TransportModeSelectorSheetProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const summaryText = useMemo(() => {
    const summaryParts = [previewDistanceText, previewDurationText].filter(Boolean);
    if (summaryParts.length === 0) {
      return isLoading ? 'Loading route preview...' : 'Choose a transport mode to preview route details.';
    }

    return summaryParts.join(' • ');
  }, [isLoading, previewDistanceText, previewDurationText]);

  const makeModePressHandler = useCallback(
    (mode: TravelMode) => {
      return () => {
        if (mode === selectedMode) {
          return;
        }

        onSelectMode(mode);
      };
    },
    [onSelectMode, selectedMode]
  );

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-0 left-0 right-0 px-3"
      style={{ zIndex: 60, elevation: 20 }}>
      <View
        className="rounded-3xl border px-4 pb-5 pt-3"
        style={{
          borderColor: theme.border,
          backgroundColor: isDarkColorScheme ? 'rgba(20,24,31,0.96)' : 'rgba(255,255,255,0.97)',
        }}>
        <Text className="text-lg font-bold">Choose transportation</Text>
        <Text className="mt-1 text-xs text-muted-foreground">
          {destinationName ? `Destination: ${destinationName}` : 'Select how you want to travel'}
        </Text>

        <View className="mt-4 gap-2">
          {MODE_OPTIONS.map((option) => {
            const isSelected = option.mode === selectedMode;

            return (
              <TouchableOpacity
                key={option.mode}
                accessibilityRole="button"
                accessibilityLabel={`Select ${option.label} mode`}
                accessibilityState={{ selected: isSelected }}
                activeOpacity={0.8}
                onPress={makeModePressHandler(option.mode)}
                className={`rounded-xl border px-3 py-3 ${
                  isSelected ? 'border-primary/60 bg-primary/10' : 'border-border/50 bg-background'
                }`}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name={option.icon} size={18} color={isSelected ? theme.primary : theme.foreground} />
                    <View>
                      <Text className="text-sm font-semibold">{option.label}</Text>
                      <Text className="text-xs text-muted-foreground">{option.description}</Text>
                    </View>
                  </View>
                  {isSelected ? <Ionicons name="checkmark-circle" size={18} color={theme.primary} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-4 rounded-xl border border-border/40 bg-background px-3 py-3">
          <Text className="text-xs font-semibold text-muted-foreground">Route preview</Text>
          <Text className="mt-1 text-sm font-semibold">{summaryText}</Text>
          {errorMessage ? <Text className="mt-1 text-xs text-destructive">{errorMessage}</Text> : null}
        </View>

        <View className="mt-4 flex-row items-center gap-2">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cancel navigation"
            activeOpacity={0.85}
            onPress={onCancel}
            className="h-11 flex-1 items-center justify-center rounded-xl border border-border bg-background">
            <Text className="text-sm font-semibold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Start navigation"
            activeOpacity={0.85}
            onPress={onStartNavigation}
            disabled={!canStartNavigation}
            className={`h-11 flex-1 items-center justify-center rounded-xl ${
              canStartNavigation ? 'bg-primary' : 'bg-muted'
            }`}>
            <Text
              className={`text-sm font-semibold ${canStartNavigation ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              Start Navigation
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
