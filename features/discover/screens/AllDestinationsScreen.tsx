import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { EventListContent } from '../../event/components';
import { WorkshopListContent } from '../../workshops/screens';
import { useQueryClient } from '@tanstack/react-query';
import DestinationsTab from './AllDestinationTab/DestinationsTab';
import BlogsTab from './AllBlogTab/BlogsTab';
import { EventStatus } from '@/features/event/types';

type Props = StackScreenProps<MainStackParamList, 'AllDestinations'>;

type CategoryType = 'Points' | 'Workshops' | 'Events' | 'Blogs';

export default function AllDestinationsScreen({ navigation, route }: Props) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [activeTab, setActiveTab] = useState<CategoryType>(route.params?.initialTab || 'Points');

  const initialAttractionId = route.params?.selectedAttractionId;


  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);


  const renderHeader = () => {
    let title = 'Discover';
    switch (activeTab) {
      case 'Points':
        title = 'Destinations';
        break;
      case 'Workshops':
        title = 'Workshops';
        break;
      case 'Events':
        title = 'Upcoming Events';
        break;
      case 'Blogs':
        title = 'Travel Stories';
        break;
    }
    return (
      <View className="flex-row items-center justify-between border-b px-4 py-3" style={{ borderColor: theme.border }}>
        <View className="flex-1 flex-row items-center">
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
            className="-ml-2 p-2">
            <Ionicons name="arrow-back" size={24} color={theme.foreground} />
          </TouchableOpacity>
          <Text className="ml-1 text-lg font-bold" style={{ color: theme.foreground }}>
            {title}
          </Text>
        </View>
      </View>
    );
  };

  const renderTabs = () => (
    <View style={{ paddingVertical: 12 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}>
        {(['Points', 'Workshops', 'Events', 'Blogs'] as CategoryType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab);
            }}
            style={[
              {
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 16,
                borderWidth: 1,
              },
              activeTab === tab
                ? { backgroundColor: theme.primary, borderColor: theme.primary }
                : { backgroundColor: 'transparent', borderColor: theme.border },
            ]}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: activeTab === tab ? '#fff' : theme.mutedForeground,
              }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (activeTab === 'Events') {
    return <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
      {renderHeader()}
      {renderTabs()}
      <EventListContent initialStatus={EventStatus.UPCOMING} />
    </SafeAreaView>;
  }

  if (activeTab === 'Workshops') {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
        {renderHeader()}
        {renderTabs()}
        <WorkshopListContent
          onNavigateToDetail={(id) => navigation.navigate('WorkshopDetail', { workshopId: id })}
        />
      </SafeAreaView>
    );
  }
  if (activeTab === 'Points') {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
        {renderHeader()}
        {renderTabs()}
        <DestinationsTab initialAttractionId={initialAttractionId} />
      </SafeAreaView>
    );
  }
  if (activeTab === 'Blogs') {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
        {renderHeader()}
        {renderTabs()}
        <BlogsTab />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
      {renderHeader()}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => { }}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
        {renderTabs()}
      </ScrollView>
    </SafeAreaView>
  );
}
