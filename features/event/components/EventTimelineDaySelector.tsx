import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import type { EventTimelineDayOption } from '../hooks/useEventTimelineMapController';

type EventTimelineDaySelectorProps = {
  options: EventTimelineDayOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export default function EventTimelineDaySelector({
  options,
  selectedDate,
  onSelectDate,
}: EventTimelineDaySelectorProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  if (options.length === 0) {
    return null;
  }

  return (
    <View
      className="rounded-xl border px-2 py-2"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
      }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((option) => {
          const isActive = option.date === selectedDate;

          return (
            <Pressable
              key={option.date}
              onPress={() => onSelectDate(option.date)}
              className="rounded-lg px-3 py-2"
              style={{
                backgroundColor: isActive ? theme.primary : theme.muted,
              }}>
              <Text
                className="text-xs font-semibold"
                style={{
                  color: isActive ? '#ffffff' : theme.foreground,
                }}>
                {option.label}
              </Text>
              <Text
                className="text-[11px]"
                style={{
                  color: isActive ? '#ffffff' : theme.mutedForeground,
                }}>
                {option.eventCount} event{option.eventCount === 1 ? '' : 's'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
