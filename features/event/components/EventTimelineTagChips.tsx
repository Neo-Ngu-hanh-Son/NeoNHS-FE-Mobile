import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import type { EventTimelineTagOption } from '../hooks/useEventTimelineMapController';

type EventTimelineTagChipsProps = {
  options: EventTimelineTagOption[];
  activeTagId: string;
  onSelectTag: (tagId: string) => void;
};

export default function EventTimelineTagChips({ options, activeTagId, onSelectTag }: EventTimelineTagChipsProps) {
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
          const isActive = option.id === activeTagId;

          return (
            <Pressable
              key={option.id}
              onPress={() => onSelectTag(option.id)}
              className="rounded-full px-3 py-1.5"
              style={{
                backgroundColor: isActive ? theme.primary : theme.muted,
              }}>
              <Text
                className="text-xs font-semibold"
                style={{
                  color: isActive ? '#ffffff' : theme.foreground,
                }}>
                {option.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
