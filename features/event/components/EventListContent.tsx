import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { Text } from '@/components/ui/text';
import { SmartImage } from '@/components/ui/smart-image';
import { useInfiniteEvents } from '../hooks/useInfiniteEvents';
import { useEventTags } from '../hooks/useEventTags';
import { EventStatus, EventResponse, EventFilterParams } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '@/app/navigations/NavigationParamTypes';

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 800;

const STATUS_OPTIONS = [
  { label: 'Upcoming', value: EventStatus.UPCOMING },
  { label: 'Ongoing', value: EventStatus.ONGOING },
  { label: 'Completed', value: EventStatus.COMPLETED },
  { label: 'Cancelled', value: EventStatus.CANCELLED },
];

export interface EventListContentProps {
  initialStatus?: EventStatus;
}

export function EventListContent({ initialStatus }: EventListContentProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<EventStatus | null>(initialStatus || null);
  const [isTicketRequired, setIsTicketRequired] = useState<boolean | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { data: tagsData, isLoading: tagsLoading } = useEventTags();
  const tags = tagsData ?? [];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchQuery.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchParams = useMemo<Omit<EventFilterParams, 'page'>>(() => {
    const params: Omit<EventFilterParams, 'page'> = {
      size: PAGE_SIZE,
      sortDir: 'desc',
    };
    if (debouncedKeyword) params.name = debouncedKeyword;
    if (selectedStatus) params.status = selectedStatus;
    if (isTicketRequired !== null) params.isTicketRequired = isTicketRequired;
    if (selectedTagIds.length > 0) params.tagIds = selectedTagIds;
    return params;
  }, [debouncedKeyword, selectedStatus, isTicketRequired, selectedTagIds]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
    isError,
  } = useInfiniteEvents(searchParams);

  const events = useMemo(() => data?.pages.flatMap((page) => page.content) ?? [], [data]);
  const totalElements = data?.pages[0]?.totalElements ?? 0;

  const activeFiltersCount =
    (selectedStatus ? 1 : 0) + (isTicketRequired !== null ? 1 : 0) + selectedTagIds.length;

  const clearFilters = () => {
    setSelectedStatus(null);
    setIsTicketRequired(null);
    setSelectedTagIds([]);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderHeader = () => (
    <View className="px-4 pt-3">
      <View className="flex-row gap-3">
        <View className="flex-1 flex-row items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: theme.muted }}>
          <Ionicons name="search" size={20} color={theme.mutedForeground} />
          <TextInput
            placeholder="Search events..."
            placeholderTextColor={theme.mutedForeground}
            className="flex-1 text-sm"
            style={{ color: theme.foreground, paddingTop: 0, paddingBottom: 0 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => setDebouncedKeyword(searchQuery.trim())}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={theme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          className="relative items-center justify-center rounded-xl p-3"
          style={{ backgroundColor: showFilters ? theme.primary : theme.muted }}
          onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options-outline" size={20} color={showFilters ? '#fff' : theme.foreground} />
          {activeFiltersCount > 0 && !showFilters && (
            <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-red-500">
              <Text className="text-[9px] font-bold text-white">{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View className="mt-3 rounded-xl border p-3" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
          <Text className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: theme.mutedForeground }}>
            Status
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: !selectedStatus ? theme.primary : theme.muted }}
              onPress={() => setSelectedStatus(null)}>
              <Text className="text-xs font-bold" style={{ color: !selectedStatus ? '#fff' : theme.mutedForeground }}>
                All
              </Text>
            </TouchableOpacity>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: selectedStatus === opt.value ? theme.primary : theme.muted }}
                onPress={() => setSelectedStatus(opt.value)}>
                <Text className="text-xs font-bold" style={{ color: selectedStatus === opt.value ? '#fff' : theme.mutedForeground }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {tags.length > 0 && (
            <>
              <Text className="mb-2 mt-3 text-xs font-bold uppercase tracking-wider" style={{ color: theme.mutedForeground }}>
                Event Tags
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5 border"
                      style={{
                        backgroundColor: isSelected ? theme.primary : 'transparent',
                        borderColor: isSelected ? theme.primary : (tag.tagColor || theme.border),
                      }}
                      onPress={() => toggleTag(tag.id)}>
                      {tag.iconUrl && (
                        <SmartImage
                          uri={tag.iconUrl}
                          className="h-3.5 w-3.5 rounded-full"
                          style={{ tintColor: isSelected ? '#fff' : (tag.tagColor || theme.foreground) }}
                        />
                      )}
                      <Text
                        className="text-xs font-bold"
                        style={{ color: isSelected ? '#fff' : (tag.tagColor || theme.mutedForeground) }}>
                        {tag.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          <Text className="mb-2 mt-3 text-xs font-bold uppercase tracking-wider" style={{ color: theme.mutedForeground }}>
            Ticket Required
          </Text>
          <View className="flex-row gap-2">
            {[
              { label: 'All', value: null },
              { label: 'Requires Ticket', value: true },
              { label: 'Free Event', value: false },
            ].map((opt) => (
              <TouchableOpacity
                key={String(opt.value)}
                className="flex-1 rounded-full px-3 py-1.5"
                style={{ backgroundColor: isTicketRequired === opt.value ? theme.primary : theme.muted }}
                onPress={() => setIsTicketRequired(opt.value)}>
                <Text
                  className="text-center text-xs font-bold"
                  style={{ color: isTicketRequired === opt.value ? '#fff' : theme.mutedForeground }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {(selectedStatus || isTicketRequired !== null) && (
            <TouchableOpacity className="mt-3 flex-row items-center justify-center gap-1" onPress={clearFilters}>
              <Ionicons name="refresh-outline" size={14} color={theme.primary} />
              <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
                Clear filters
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View className="mb-1 mt-2 px-1">
        <Text className="text-xs" style={{ color: theme.mutedForeground }}>
          {totalElements} event{totalElements !== 1 ? 's' : ''} found
        </Text>
      </View>
    </View>
  );

  const renderEventItem = useCallback(({ item }: { item: EventResponse }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      className="mx-4 mb-3 flex-row items-center gap-4 rounded-2xl border p-3"
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
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1">
              <View
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor:
                    item.status === EventStatus.UPCOMING
                      ? '#3b82f6'
                      : item.status === EventStatus.ONGOING
                        ? '#10b981'
                        : item.status === EventStatus.CANCELLED
                          ? '#ef4444'
                          : '#6b7280',
                }}
              />
              <Text
                className="text-[10px] font-bold uppercase"
                style={{
                  color:
                    item.status === EventStatus.UPCOMING
                      ? '#3b82f6'
                      : item.status === EventStatus.ONGOING
                        ? '#10b981'
                        : item.status === EventStatus.CANCELLED
                          ? '#ef4444'
                          : '#6b7280',
                }}>
                {item.status}
              </Text>
            </View>
            {item.isTicketRequired && (
              <View className="flex-row items-center gap-1 rounded bg-orange-100 px-1.5 py-0.5">
                <Ionicons name="ticket-outline" size={10} color="#f97316" />
                <Text className="text-[9px] font-bold text-orange-600 uppercase">Ticket Req.</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.muted} />
    </TouchableOpacity>
  ), [theme, navigation]);

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={renderEventItem}
      ListHeaderComponent={renderHeader}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : (
          <View className="items-center py-16">
            <Ionicons name="calendar-outline" size={40} color={theme.mutedForeground} />
            <Text className="mt-3 text-base font-bold" style={{ color: theme.foreground }}>
              No events found
            </Text>
          </View>
        )
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="items-center py-6">
            <ActivityIndicator size="small" color={theme.primary} />
          </View>
        ) : (
          <View className="h-20" />
        )
      }
    />
  );
}
