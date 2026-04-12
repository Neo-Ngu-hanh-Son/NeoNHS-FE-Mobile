import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import type { EventTimelineDayOption } from '../hooks/useEventTimelineMapController';

type EventTimelineDaySelectorProps = {
  options: EventTimelineDayOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

function DayChip({
  option,
  isActive,
  onSelectDate,
  theme,
}: {
  option: EventTimelineDayOption;
  isActive: boolean;
  onSelectDate: (date: string) => void;
  theme: typeof THEME.light;
}) {
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.96)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1 : 0.96,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  }, [isActive, scale]);

  return (
    <Animated.View
      style={[
        styles.chipWrap,
        {
          backgroundColor: isActive ? theme.primary : `${theme.primary}18`,
          borderColor: isActive ? theme.primary : `${theme.primary}30`,
          transform: [{ scale }],
          // Active shadow using brand color
          shadowColor: isActive ? theme.primary : 'transparent',
          shadowOpacity: isActive ? 0.45 : 0,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          elevation: isActive ? 6 : 0,
        },
      ]}>
      <Pressable
        onPress={() => onSelectDate(option.date)}
        style={styles.chipPressable}
        android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}>
        <Text style={[styles.dayLabel, { color: isActive ? '#ffffff' : theme.primary }]} numberOfLines={1}>
          {option.label}
        </Text>
        <View style={styles.countRow}>
          <View
            style={[styles.countDot, { backgroundColor: isActive ? 'rgba(255,255,255,0.6)' : `${theme.primary}60` }]}
          />
          <Text style={[styles.countLabel, { color: isActive ? 'rgba(255,255,255,0.85)' : `${theme.primary}99` }]}>
            {option.eventCount} {option.eventCount === 1 ? 'event' : 'events'}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function EventTimelineDaySelector({
  options,
  selectedDate,
  onSelectDate,
}: EventTimelineDaySelectorProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  if (options.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {options.map((option) => (
        <DayChip
          key={option.date}
          option={option}
          isActive={option.date === selectedDate}
          onSelectDate={onSelectDate}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 1,
    alignItems: 'center',
  },
  chipWrap: {
    borderRadius: 12,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  chipPressable: {
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    minWidth: 72,
  },
  dayLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
