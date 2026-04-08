import React, { useCallback } from 'react';
import { FlatList, Pressable, TextInput, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import type { MapPoint } from '../../types';
import { getMarkerStyle } from '../Marker/MarkerStyles';

type MapSearchBarProps<TPoint extends MapPoint = MapPoint> = {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onSelectResult: (point: TPoint) => void;
  results: TPoint[];
  isSearching: boolean;
  topInset?: number;
};

export default function MapSearchBar<TPoint extends MapPoint = MapPoint>({
  value,
  onChangeText,
  onClear,
  onSelectResult,
  results,
  isSearching,
  topInset = 0,
}: MapSearchBarProps<TPoint>) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const renderItem = useCallback(
    ({ item }: { item: TPoint }) => {
      const markerStyle = getMarkerStyle(item.type);

      return (
        <Pressable
          onPress={() => onSelectResult(item)}
          className="flex-row items-center px-4 py-3"
          android_ripple={{ color: isDarkColorScheme ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
          <View
            className="mr-3 h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: markerStyle.bg,
              borderColor: markerStyle.border,
              borderWidth: 1,
            }}>
            <MaterialCommunityIcons name={markerStyle.icon} size={15} color="#ffffff" />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-semibold" style={{ color: theme.foreground }} numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="mt-0.5 text-xs" style={{ color: theme.mutedForeground }} numberOfLines={1}>
              {item.description || item.type}
            </Text>
          </View>
        </Pressable>
      );
    },
    [isDarkColorScheme, onSelectResult, theme.foreground, theme.mutedForeground]
  );

  const keyExtractor = useCallback((item: TPoint) => item.id, []);

  return (
    <View pointerEvents="box-none" className="absolute left-0 right-0 z-50 px-4" style={{ top: topInset + 8 }}>
      <View
        className="flex-row items-center rounded-xl border px-3"
        style={{
          backgroundColor: theme.card,
          borderColor: theme.border,
          minHeight: 48,
        }}>
        <Ionicons name="search" size={18} color={theme.mutedForeground} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search places, events, workshops..."
          placeholderTextColor={theme.mutedForeground}
          className="flex-1 px-2 py-3"
          style={{ color: theme.foreground }}
          returnKeyType="search"
        />

        {value.length > 0 && (
          <Pressable onPress={onClear} className="rounded-full p-1" accessibilityLabel="Clear map search">
            <Ionicons name="close-circle" size={18} color={theme.mutedForeground} />
          </Pressable>
        )}
      </View>

      {isSearching && (
        <Animated.View
          entering={FadeInUp.duration(160)}
          exiting={FadeOutUp.duration(130)}
          layout={LinearTransition.duration(150)}
          className="mt-2 overflow-hidden rounded-xl border"
          style={{
            backgroundColor: theme.card,
            borderColor: theme.border,
            maxHeight: 280,
          }}>
          <FlatList
            data={results}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: theme.border }} />}
            ListEmptyComponent={
              <View className="px-4 py-4">
                <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                  No matching locations found.
                </Text>
              </View>
            }
          />
        </Animated.View>
      )}
    </View>
  );
}
