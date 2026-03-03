import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { IconButton } from '@/components/Buttons/IconButton';
import { Text } from '@/components/ui/text';
import { logger } from '@/utils/logger';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { CompositeScreenProps, useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  MainStackParamList,
  RootStackParamList,
  TabsStackParamList,
} from '@/app/navigations/NavigationParamTypes';
import { StackScreenProps } from '@react-navigation/stack';
import { fetchStats } from '@/services/api/common/statsService';
import { StatsResponse } from '@/types/common';
import SectionHeader from '../SectionHeader';

type Props = {};

type ExploreItem = {
  key: string;
  name: string;
  count: number;
  icon: ComponentProps<typeof Ionicons>['name'];
};

const exploreItems: ExploreItem[] = [
  { key: 'destinations', name: 'Destinations', count: 0, icon: 'location-outline' },
  { key: 'workshops', name: 'Workshops', count: 0, icon: 'construct-outline' },
  { key: 'events', name: 'Events', count: 0, icon: 'calendar-outline' },
  { key: 'blogs', name: 'Blogs', count: 0, icon: 'newspaper-outline' },
];

type ScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function ExploreSection() {
  const { navigate } = useNavigation<ScreenProps['navigation']>();
  const [activeItemKey, setActiveItemKey] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsResponse>({
    attractionCount: 0,
    workshopCount: 0,
    eventCount: 0,
    blogCount: 0,
    pointCount: 0,
  });
  const { isDarkColorScheme } = useTheme();

  // useFocusEffect(
  //   useCallback(() => {
  //     const startFetch = async () => {
  //       try {
  //         const response = await fetchStats();
  //         if (response.success) {
  //           setStats(response.data);
  //         } else {
  //           logger.error('Failed to fetch stats');
  //         }
  //       } catch (error) {
  //         logger.error('Error fetching stats:', error);
  //       }
  //     };
  //     startFetch();
  //   }, [])
  // );

  const handleNavigate = (item: ExploreItem) => {
    switch (item.key) {
      case 'destinations':
        logger.info('Navigate to Destinations');
        break;
      case 'workshops':
        logger.info('Navigate to Workshops');
        break;
      case 'events':
        logger.info('Navigate to Events');
        break;
      case 'blogs':
        navigate('Main', { screen: 'BlogList' });
        break;
    }
  };

  const getCountForItem = (key: string): number => {
    switch (key) {
      case 'destinations':
        return stats.attractionCount || 0;
      case 'workshops':
        return stats.workshopCount || 0;
      case 'events':
        return stats.eventCount || 0;
      case 'blogs':
        return stats.blogCount || 0;
      default:
        return 0;
    }
  };
  return (
    <View className="mb-4">
      <SectionHeader title="Explore" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 8,
          width: '100%',
        }}
        contentContainerClassName="justify-between">
        {exploreItems.map((item, index) => {
          const isActive = activeItemKey === item.key;

          return (
            <Pressable
              key={item.key}
              onPressIn={() => setActiveItemKey(item.key)}
              onPressOut={() =>
                setActiveItemKey((current) => (current === item.key ? null : current))
              }
              onPress={() => handleNavigate(item)}
              className="items-center"
              style={{ marginRight: index === exploreItems.length - 1 ? 0 : 20 }}>
              <View
                className={[
                  'mb-2 h-14 w-14 items-center justify-center rounded-sm border border-border bg-primary',
                  'shadow-sm',
                  isActive ? 'scale-105' : 'scale-100',
                ].join(' ')}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 6,
                  elevation: 3,
                }}>
                <View pointerEvents="none">
                  <IconButton
                    icon={item.icon}
                    iconSize={24}
                    borderless
                    buttonStyle={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: 'transparent',
                    }}
                    color={
                      isDarkColorScheme
                        ? THEME.dark.primaryForeground
                        : THEME.light.primaryForeground
                    }
                  />
                </View>
              </View>

              <Text
                className="text-sm font-medium text-foreground"
                style={{
                  color: isDarkColorScheme ? THEME.dark.foreground : THEME.light.foreground,
                }}>
                {item.name}
              </Text>
              {/* <Text
                className="text-xs text-muted-foreground"
                style={{
                  color: isDarkColorScheme
                    ? THEME.dark.mutedForeground
                    : THEME.light.mutedForeground,
                }}>
                {getCountForItem(item.key)}
              </Text> */}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
