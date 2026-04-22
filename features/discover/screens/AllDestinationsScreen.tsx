import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useAttractions } from '../hooks/useAttractions';
import { useAllEvents } from '../../event/hooks/useAllEvents';
import { WorkshopListContent } from '../../workshops/screens';
import { useBlogList } from '@/features/blog';
import type { Blog } from '@/features/blog/types';
import { useQueryClient } from '@tanstack/react-query';
import { SmartImage } from '@/components/ui/smart-image';
import AttractionsTab from './ViewAllTabs/AttractionsTab';

type Props = StackScreenProps<MainStackParamList, 'AllDestinations'>;

type CategoryType = 'Points' | 'Workshops' | 'Events' | 'Blogs';

export default function AllDestinationsScreen({ navigation, route }: Props) {
  const queryClient = useQueryClient();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [activeTab, setActiveTab] = useState<CategoryType>(route.params?.initialTab || 'Points');

  const initialAttractionId = route.params?.selectedAttractionId;
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const { data: attractions, isLoading: attractionsLoading, refetch: refetchAttractions } = useAttractions();

  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useAllEvents();
  const {
    blogs,
    loading: blogsLoading,
    fetchBlogs,
    refresh: refetchBlogs,
  } = useBlogList({
    size: 20,
  });

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const loading =
    (activeTab === 'Points' && (attractionsLoading || initialAttractionId)) ||
    (activeTab === 'Events' && eventsLoading) ||
    (activeTab === 'Blogs' && blogsLoading);

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.allSettled([
      refetchAttractions(),
      refetchEvents(),
      refetchBlogs(),
      queryClient.refetchQueries({ queryKey: ['workshop-search'] }),
      queryClient.refetchQueries({ queryKey: ['workshop-tags'] }),
    ]).finally(() => setRefreshing(false));
  }, [queryClient, refetchAttractions, refetchEvents, refetchBlogs]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const filteredEvents = useMemo(() => {
    const evts = events ?? [];
    if (!searchQuery.trim()) return evts;
    const q = searchQuery.toLowerCase();
    return evts.filter(
      (e) => e.name.toLowerCase().includes(q) || (e.locationName && e.locationName.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const q = searchQuery.toLowerCase();
    return blogs.filter(
      (b: Blog) =>
        b.title.toLowerCase().includes(q) ||
        (b.summary?.toLowerCase().includes(q) ?? false) ||
        (b.user?.fullname?.toLowerCase().includes(q) ?? false)
    );
  }, [blogs, searchQuery]);

  const renderHeader = () => {
    let title = 'Discover';
    switch (activeTab) {
      case 'Points':
        if (initialAttractionId) {
          const attraction = attractions?.find((a) => a.id === initialAttractionId);
          title = attraction ? attraction.name : 'Destinations';
        } else {
          title = 'Destinations';
        }
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

  const renderSearchAndFilter = () => {
    if (activeTab === 'Workshops') return null;
    if (activeTab === 'Points') return null;
    return (
      <View className="px-4 pt-3">
        <View
          className="flex-1 flex-row items-center gap-2 rounded-xl px-4 py-3"
          style={{ backgroundColor: theme.muted }}>
          <Ionicons name="search" size={20} color={theme.mutedForeground} />
          <TextInput
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            placeholderTextColor={theme.mutedForeground}
            className="flex-1 text-sm"
            style={{ color: theme.foreground, paddingTop: 0, paddingBottom: 0 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderList = () => {
    if (loading) {
      return (
        <View className="items-center py-10">
          <Ionicons name="refresh" size={24} color={theme.primary} />
          <Text className="mt-2 text-sm" style={{ color: theme.mutedForeground }}>
            Loading...
          </Text>
        </View>
      );
    }
    if (activeTab === 'Events') {
      const data = filteredEvents;
      if (data.length === 0) {
        return (
          <View className="items-center py-16">
            <Ionicons name="calendar-outline" size={40} color={theme.mutedForeground} />
            <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
              No events found
            </Text>
          </View>
        );
      }
      return (
        <View className="px-4 pb-10 pt-2">
          {data.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
              className="mb-3 flex-row items-center gap-4 rounded-2xl border p-3"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <SmartImage uri={item.thumbnailUrl} className="h-24 w-24 rounded-2xl object-cover" />
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: theme.foreground }}>
                  {item.name}
                </Text>
                <View className="mt-1 gap-1">
                  {item.startTime && (
                    <Text className="text-sm font-semibold" style={{ color: theme.primary }}>
                      {new Date(item.startTime).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </Text>
                  )}
                  <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                    {item.locationName || 'TBD'}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    <View
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          item.status === 'UPCOMING'
                            ? '#3b82f6'
                            : item.status === 'ONGOING'
                              ? '#10b981'
                              : item.status === 'CANCELLED'
                                ? '#ef4444'
                                : '#6b7280',
                      }}
                    />
                    <Text
                      className="text-[10px] font-bold uppercase"
                      style={{
                        color:
                          item.status === 'UPCOMING'
                            ? '#3b82f6'
                            : item.status === 'ONGOING'
                              ? '#10b981'
                              : item.status === 'CANCELLED'
                                ? '#ef4444'
                                : '#6b7280',
                      }}>
                      {item.status}
                    </Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.muted} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    if (activeTab === 'Blogs') {
      const data = filteredBlogs;
      if (data.length === 0) {
        return (
          <View className="items-center py-16">
            <Ionicons name="book-outline" size={40} color={theme.mutedForeground} />
            <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
              No blogs found
            </Text>
          </View>
        );
      }
      return (
        <View className="px-4 pb-10 pt-2">
          {data.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => navigation.navigate('BlogDetails', { blogId: item.id })}
              className="mb-3 flex-row items-center gap-4 rounded-2xl border p-3"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <SmartImage uri={item.thumbnailUrl || item.bannerUrl} className="h-24 w-24 rounded-2xl object-cover" />
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: theme.foreground }}>
                  {item.title}
                </Text>
                {item.summary && (
                  <Text className="mt-1 text-xs" numberOfLines={2} style={{ color: theme.mutedForeground }}>
                    {item.summary}
                  </Text>
                )}
                <View className="mt-1 flex-row items-center gap-2">
                  <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
                    {item.user?.fullname || 'NeoNHS'}
                  </Text>
                  <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                    •{' '}
                    {new Date(item.publishedAt || item.createdAt || Date.now()).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.muted} />
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    return null;
  };
  if (activeTab === 'Workshops') {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
        {renderHeader()}
        {renderTabs()}
        <WorkshopListContent onNavigateToDetail={(id) => navigation.navigate('WorkshopDetail', { workshopId: id })} />
      </SafeAreaView>
    );
  }
  if (activeTab === 'Points') {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
        <AttractionsTab initialAttractionId={initialAttractionId} />;
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
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
        {renderTabs()}
        {renderSearchAndFilter()}
        {renderList()}
      </ScrollView>
    </SafeAreaView>
  );
}
