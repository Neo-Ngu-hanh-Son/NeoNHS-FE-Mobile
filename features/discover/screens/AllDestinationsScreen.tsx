import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { Attraction, MapPoint } from '../../map/types';
import { useAttractions } from '../hooks/useAttractions';
import { usePointsByAttraction } from '../hooks/usePointsByAttraction';
import { useAllEvents } from '../../event/hooks/useAllEvents';
import { WorkshopListContent } from '../../workshops/screens';
import { useBlogList } from '@/features/blog';
import type { Blog } from '@/features/blog/types';
import { useQueryClient } from '@tanstack/react-query';

type Props = StackScreenProps<MainStackParamList, 'AllDestinations'>;

type CategoryType = 'Points' | 'Workshops' | 'Events' | 'Blogs';

export default function AllDestinationsScreen({ navigation, route }: Props) {
  const queryClient = useQueryClient();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [activeTab, setActiveTab] = useState<CategoryType>(route.params?.initialTab || 'Points');

  const [selectedAttractionId, setSelectedAttractionId] = useState<string | undefined>(
    route.params?.selectedAttractionId
  );
  const [refreshing, setRefreshing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: attractions,
    isLoading: attractionsLoading,
    refetch: refetchAttractions,
  } = useAttractions();

  const {
    data: points,
    isLoading: pointsLoading,
    refetch: refetchPoints,
  } = usePointsByAttraction(selectedAttractionId);

  const { data: events, isLoading: eventsLoading, refetch: refetchEvents } = useAllEvents();
  const { blogs, loading: blogsLoading, fetchBlogs, refresh: refetchBlogs } = useBlogList({
    size: 20,
  });

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const loading =
    (activeTab === 'Points' &&
      (attractionsLoading || (selectedAttractionId ? pointsLoading : false))) ||
    (activeTab === 'Events' && eventsLoading) ||
    (activeTab === 'Blogs' && blogsLoading);

  useEffect(() => {
    if (route.params?.selectedAttractionId) {
      setSelectedAttractionId(route.params.selectedAttractionId);
    }
  }, [route.params?.selectedAttractionId]);

  useEffect(() => {
    if (route.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.allSettled([
      refetchAttractions(),
      ...(selectedAttractionId ? [refetchPoints()] : []),
      refetchEvents(),
      refetchBlogs(),
      queryClient.refetchQueries({ queryKey: ['workshop-search'] }),
      queryClient.refetchQueries({ queryKey: ['workshop-tags'] }),
    ]).finally(() => setRefreshing(false));
  }, [
    queryClient,
    refetchAttractions,
    refetchPoints,
    refetchEvents,
    refetchBlogs,
    selectedAttractionId,
  ]);

  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const filteredEvents = useMemo(() => {
    const evts = events ?? [];
    if (!searchQuery.trim()) return evts;
    const q = searchQuery.toLowerCase();
    return evts.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.locationName && e.locationName.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  const filteredAttractions = useMemo(() => {
    const source = selectedAttractionId ? (points ?? []) : (attractions ?? []);
    if (!searchQuery.trim()) return source;
    const q = searchQuery.toLowerCase();
    return source.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        ((a as Attraction).address && (a as Attraction).address.toLowerCase().includes(q))
    );
  }, [attractions, points, selectedAttractionId, searchQuery]);

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
    let showBackToAttractions = false;
    switch (activeTab) {
      case 'Points':
        if (selectedAttractionId) {
          const attr = (attractions ?? []).find((a) => a.id === selectedAttractionId);
          title = attr ? attr.name : 'Points';
          showBackToAttractions = true;
        } else {
          title = 'Popular Destinations';
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
      <View
        className="flex-row items-center justify-between border-b px-4 py-3"
        style={{ borderColor: theme.border }}>
        <View className="flex-1 flex-row items-center">
          <TouchableOpacity
            onPress={() => {
              if (showBackToAttractions) {
                setSelectedAttractionId(undefined);
              } else {
                navigation.goBack();
              }
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
    <View className="py-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
          alignItems: 'center',
        }}>
        {(['Points', 'Workshops', 'Events', 'Blogs'] as CategoryType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              setActiveTab(tab);
              if (tab !== 'Points') setSelectedAttractionId(undefined);
            }}
            className={`h-10 items-center justify-center rounded-2xl border px-5 ${activeTab === tab ? 'border-primary bg-primary' : 'bg-transparent'}`}
            style={activeTab !== tab ? { borderColor: theme.border } : undefined}>
            <Text
              className={`text-sm font-bold ${activeTab === tab ? 'text-white' : ''}`}
              style={activeTab !== tab ? { color: theme.mutedForeground } : undefined}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderSearchAndFilter = () => {
    if (activeTab === 'Workshops') return null;
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



    if (activeTab === 'Points') {
      const data = filteredAttractions;
      if (data.length === 0) {
        return (
          <View className="items-center py-16">
            <Ionicons name="location-outline" size={40} color={theme.mutedForeground} />
            <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
              No destinations found
            </Text>
          </View>
        );
      }
      return (
        <View className="px-4 pb-10 pt-2">
          {data.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                if (!selectedAttractionId) {
                  setSelectedAttractionId(item.id);
                } else {
                  navigation.navigate('PointDetail', { pointId: item.id });
                }
              }}
              className="mb-3 flex-row items-center gap-4 rounded-2xl border p-3"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}>
              <Image
                source={{ uri: (item as any).thumbnailUrl || (item as any).image || undefined }}
                className="h-24 w-24 rounded-2xl object-cover"
              />
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: theme.foreground }}>
                  {item.name}
                </Text>
                {!selectedAttractionId && (
                  <View className="mt-1 gap-1">
                    <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                      {(item as Attraction).address}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <View
                        className={`h-2 w-2 rounded-full ${(item as Attraction).status === 'OPEN' ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                      <Text
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: (item as Attraction).status === 'OPEN' ? '#10b981' : '#ef4444',
                        }}>
                        {(item as Attraction).status || 'CLOSED'}
                      </Text>
                    </View>
                  </View>
                )}
                {selectedAttractionId && (
                  <View className="mt-1 flex-row items-center gap-2">
                    <View className="flex-row items-center gap-1 rounded-lg bg-primary/10 px-2 py-0.5">
                      <Text className="text-[10px] font-bold uppercase text-primary">
                        {(item as MapPoint).type}
                      </Text>
                    </View>
                    {(item as MapPoint).estTimeSpent && (
                      <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                        • {(item as MapPoint).estTimeSpent} mins
                      </Text>
                    )}
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.muted} />
            </TouchableOpacity>
          ))}
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
              <Image
                source={{ uri: item.thumbnailUrl || undefined }}
                className="h-24 w-24 rounded-2xl object-cover"
              />
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
              <Image
                source={{ uri: item.thumbnailUrl || item.bannerUrl || undefined }}
                className="h-24 w-24 rounded-2xl object-cover"
              />
              <View className="flex-1">
                <Text className="text-lg font-bold" style={{ color: theme.foreground }}>
                  {item.title}
                </Text>
                {item.summary && (
                  <Text
                    className="mt-1 text-xs"
                    numberOfLines={2}
                    style={{ color: theme.mutedForeground }}>
                    {item.summary}
                  </Text>
                )}
                <View className="mt-1 flex-row items-center gap-2">
                  <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
                    {item.user?.fullname || 'NeoNHS'}
                  </Text>
                  <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                    •{' '}
                    {new Date(item.publishedAt || item.createdAt || Date.now()).toLocaleDateString(
                      'vi-VN',
                      {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      }
                    )}
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
        <WorkshopListContent
          onNavigateToDetail={(id) => navigation.navigate('WorkshopDetail', { workshopId: id })}
        />
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
