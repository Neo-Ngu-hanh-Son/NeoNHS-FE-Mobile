import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

type MapMarkerFilterChipProps = {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  active: boolean;
  onPress: () => void;
};

export default function MapMarkerFilterChip({
  label,
  icon,
  active,
  onPress,
}: MapMarkerFilterChipProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const activeBackground = theme.primary;
  const inactiveBackground = isDarkColorScheme ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.96)';
  const activeTextColor = theme.primaryForeground;
  const inactiveTextColor = theme.foreground;

  return (
    <Pressable
      onPress={onPress}
      className="mr-2 rounded-full border px-3 py-2"
      style={{
        borderColor: active ? theme.primary : theme.border,
        backgroundColor: active ? activeBackground : inactiveBackground,
      }}>
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={14} color={active ? activeTextColor : inactiveTextColor} />
        <Text className="text-xs font-medium" style={{ color: active ? activeTextColor : inactiveTextColor }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
