import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, Animated } from 'react-native';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import type { EventTimelineTagOption } from '../hooks/useEventTimelineMapController';

type EventTimelineTagChipsProps = {
  options: EventTimelineTagOption[];
  activeTagId: string;
  onSelectTag: (tagId: string) => void;
};

function Chip({
  option,
  isActive,
  onSelectTag,
  baseColor,
}: {
  option: EventTimelineTagOption;
  isActive: boolean;
  onSelectTag: (tagId: string) => void;
  baseColor: string;
}) {
  const scale = React.useRef(new Animated.Value(isActive ? 1 : 0.95)).current;

  React.useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1 : 0.95,
      useNativeDriver: true,
      friction: 6,
    }).start();
  }, [isActive]);

  const opacity = scale.interpolate({
    inputRange: [0.95, 1],
    outputRange: [0.7, 1],
  });

  return (
    <Animated.View
      style={[
        styles.chipWrap,
        {
          backgroundColor: baseColor,
          transform: [{ scale }],
          opacity,
        },
        isActive && styles.activeBorder,
      ]}>
      <Pressable
        onPress={() => onSelectTag(option.id)}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={`Filter by ${option.name}`}
        style={styles.chipPressable}>
        <Text style={styles.chipText} numberOfLines={1}>
          {option.name}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function EventTimelineTagChips({ options, activeTagId, onSelectTag }: EventTimelineTagChipsProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  if (options.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {options.map((option) => {
        const isActive = option.id === activeTagId;
        const baseColor = option.color ?? theme.primary;

        return (
          <Chip key={option.id} option={option} isActive={isActive} onSelectTag={onSelectTag} baseColor={baseColor} />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    alignItems: 'center',
  },
  chipWrap: {
    borderRadius: 999,
    marginRight: 8,
  },
  chipPressable: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.1,
    color: '#ffffff',
  },
  activeBorder: {
    borderWidth: 1,
    borderColor: '#ffffff',
  },
});
