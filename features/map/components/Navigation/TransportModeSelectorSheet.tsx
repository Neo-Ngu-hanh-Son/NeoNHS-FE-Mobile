import React, { useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { TravelMode } from '../../types';

type TransportModeSelectorSheetProps = {
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
  icon: React.ComponentProps<typeof FontAwesome6>['name'];
};

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'WALK',
    label: 'Walk',
    icon: 'person-walking',
  },
  {
    mode: 'DRIVE',
    label: 'Drive',
    icon: 'car',
  },
  // {
  //   mode: 'BICYCLE',
  //   label: 'Bicycle',
  //   icon: 'bicycle',
  // },
  {
    mode: 'TWO_WHEELER',
    label: 'Motorbike',
    icon: 'motorcycle',
  },
];

export default function TransportModeSelectorSheet({
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

  const selectedModeLabel = useMemo(() => {
    return MODE_OPTIONS.find((option) => option.mode === selectedMode)?.label ?? 'Walk';
  }, [selectedMode]);

  return (
    <View
      pointerEvents="box-none"
      className="absolute bottom-3 left-0 right-0 px-3"
      style={{ zIndex: 60, elevation: 20 }}>
      <View
        className="rounded-2xl border px-3 pb-3 pt-2"
        style={{
          borderColor: theme.border,
          backgroundColor: isDarkColorScheme ? 'rgba(20,24,31,0.96)' : 'rgba(255,255,255,0.97)',
        }}>
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base font-bold">Choose transportation</Text>
            <Text numberOfLines={1} className="mt-0.5 text-sm text-muted-foreground">
              {destinationName ? `To ${destinationName}` : 'Select how you want to travel'}
            </Text>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cancel navigation"
            activeOpacity={0.85}
            onPress={onCancel}
            className="h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
            <Ionicons name="close" size={16} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
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
                className={`flex-1 items-center justify-center rounded-full border px-4 py-2 ${
                  isSelected ? 'border-primary/60 bg-primary/10' : 'border-border/50 bg-background'
                }`}>
                <FontAwesome6 name={option.icon} size={24} color={isSelected ? theme.primary : theme.foreground} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="mt-2.5 rounded-lg border border-border/40 px-2.5 py-2">
          <Text className="font-semibold">Travel by: {selectedModeLabel}</Text>
        </View>

        <View className="mt-2.5 rounded-lg border border-border/40 bg-background px-2.5 py-2">
          <Text className="text-xs font-semibold text-muted-foreground">Route preview</Text>
          <Text className="mt-0.5 font-semibold">{summaryText}</Text>
          {errorMessage ? <Text className="mt-1 text-xs text-destructive">{errorMessage}</Text> : null}
        </View>

        <View className="mt-2.5 flex-row items-center gap-2">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Start navigation"
            activeOpacity={0.85}
            onPress={onStartNavigation}
            disabled={!canStartNavigation}
            className={`h-10 flex-1 items-center justify-center rounded-lg ${
              canStartNavigation ? 'bg-primary' : 'bg-muted'
            }`}>
            <Text
              className={`font-semibold ${canStartNavigation ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
              Start Navigation
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
