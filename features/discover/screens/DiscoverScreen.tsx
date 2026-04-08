import { View, ScrollView, RefreshControl, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useAttractions } from '../hooks/useAttractions';
import { useEvents } from '@/features/event/hooks/useEvents';
import { EventResponse, EventStatus } from '@/features/event/types';
import { useWorkshopTemplates } from '@/features/workshops/hooks/useWorkshopTemplates';
import { WorkshopTemplateResponse } from '@/features/workshops/types';
import { SmartImage } from '@/components/ui/smart-image';
import { Attraction } from '@/features/map/types';

type DiscoverScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabsStackParamList, 'Discover'>,
  StackScreenProps<MainStackParamList>
>;

// --- Hierarchy Definitions ---
// Area (Destination) = Grouping (e.g., Marble Mountains)
// Point (Attraction) = Specific site (e.g., Huyen Khong Cave)

const BLOGS = [
  {
    id: 'b1',
    title: 'Hidden Gems of the Water Mountain',
    summary: 'Discover the secret paths and ancient shrines that most tourists miss when visiting...',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuALw1TtO_AXnQuuHWZAg9EknSOz0BWMEKDG1-OQ178gGYR88bedstWPlpr9s6QTxxC4qYy4yPcgk6z4to5PycLLwPqrcvlmK8_Rit_EghNJ3kmtjkqVd5MhHsoW-IcMiw8577bmTazb1mrXEoMrjXh6JG5pT1PK2jZY3wOA2GzRlPAmjM3IL9sH6sRV-daSkKwKDfvOXJoXbR2lR2sr_51wd6i2pEfLBbByZCVeTzWST9d9AqGng2aUYpSFxfvpUWTqjHH5gqpCGXTl',
  },
  {
    id: 'b2',
    title: 'A Guide to Buying Authentic Art',
    summary: 'How to distinguish high-quality local crafts from mass-produced souvenirs in local markets...',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAXe2ulX_LRYFncq9k4Nzsl7s9v5pbsBh9uvvgZi7uryfsJD4jY2b53ve_nMr_tyr0UxCci3RJc2h6cPiFlTqG6iS-Lwnc5sHuln79ardfp44ZxKav3ktIhlOLKJSKIZxivQtvtBkxt9kMGwwMKRpzjRg98RdyyM61aCQfhUQ9KDTuZHGv9L-wPcZ6utalJ00B8GDX9Gek4olN70eD-4lb3rbfG0tj_jSm9aLYd8-zEpRfHe5USsUgWwRyUB-pbuSolME7n1EW5GaER',
  },
];

/** Format ISO datetime to { month, day } */
function formatEventDate(dateStr?: string | null): { month: string; day: string } {
  if (!dateStr) return { month: 'TBD', day: '--' };
  const d = new Date(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return { month: months[d.getMonth()], day: String(d.getDate()).padStart(2, '0') };
}

/** Map EventStatus to display color */
function getStatusColor(status: string): string {
  switch (status) {
    case 'UPCOMING':
      return '#3b82f6';
    case 'ONGOING':
      return '#10b981';
    case 'COMPLETED':
      return '#6b7280';
    case 'CANCELLED':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

export default function DiscoverScreen({ navigation }: DiscoverScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [refreshing, setRefreshing] = useState(false);

  const { data: allAttractions, isLoading: loading, refetch: refetchAttractions } = useAttractions();

  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useEvents({
    page: 0,
    size: 5,
    status: EventStatus.UPCOMING,
    sortBy: 'startTime',
    sortDir: 'asc',
  });

  const {
    data: workshopData,
    isLoading: workshopsLoading,
    refetch: refetchWorkshops,
  } = useWorkshopTemplates({ page: 1, size: 4, sortBy: 'createdAt', sortDir: 'desc' });

  const popularAttractions = useMemo(() => (allAttractions ?? []).slice(0, 5), [allAttractions]);
  const events = useMemo(() => eventsData?.content ?? [], [eventsData]);
  const discoverWorkshops = useMemo(
    () => (workshopData?.content ?? []).filter((w) => w.isPublished !== false),
    [workshopData]
  );

  const sectionListContainerStyle = useMemo(() => ({ paddingHorizontal: 20, paddingRight: 20 }), []);

  const renderHorizontalSpacer = useCallback(() => <View style={{ width: 16 }} />, []);

  const renderPopularDestinationItem = useCallback(
    ({ item }: { item: Attraction }) => (
      <TouchableOpacity
        className="w-72 overflow-hidden rounded-2xl border shadow-sm"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
        onPress={() =>
          navigation.navigate('AllDestinations', {
            initialTab: 'Points',
            selectedAttractionId: item.id,
          })
        }>
        <View className="relative h-48">
          <SmartImage uri={item.thumbnailUrl || item.mapImageUrl || undefined} className="h-full w-full object-cover" />
          <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-lg bg-white/90 px-2 py-1 dark:bg-slate-900/90">
            <Ionicons name="star" size={12} color="#eab308" />
            <Text className="text-xs font-bold">4.8</Text>
          </View>
        </View>
        <View className="p-4">
          <Text className="text-lg font-bold" style={{ color: theme.foreground }}>
            {item.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color={theme.mutedForeground} />
            <Text className="truncate pr-4 text-sm" style={{ color: theme.mutedForeground }} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [navigation, theme.border, theme.card, theme.foreground, theme.mutedForeground]
  );

  const renderWorkshopItem = useCallback(
    ({ item }: { item: WorkshopTemplateResponse }) => {
      const thumb = item.images.find((img) => img.isThumbnail) || item.images[0];
      const tagColor = item.tags[0]?.tagColor || theme.primary;
      const tagName = item.tags[0]?.name || '';

      return (
        <TouchableOpacity
          className="w-44"
          onPress={() =>
            navigation.navigate('WorkshopDetail', {
              workshopId: item.id,
            })
          }>
          <View className="relative mb-2 h-44 w-44 overflow-hidden rounded-2xl">
            <SmartImage uri={thumb?.imageUrl} className="h-full w-full object-cover" />
            {tagName ? (
              <View className="absolute bottom-3 left-3 rounded px-2 py-0.5" style={{ backgroundColor: tagColor }}>
                <Text className="text-[10px] font-bold tracking-wider text-white">{tagName}</Text>
              </View>
            ) : null}
          </View>
          <Text className="text-sm font-bold leading-tight" style={{ color: theme.foreground }} numberOfLines={1}>
            {item.name}
          </Text>
          <View className="mt-1 flex-row items-center gap-1">
            <Ionicons name="star" size={12} color="#eab308" />
            <Text className="text-xs font-medium" style={{ color: theme.foreground }}>
              {item.averageRating.toFixed(1)} <Text className="text-slate-400">({item.totalRatings})</Text>
            </Text>
          </View>
          <Text className="mt-0.5 text-xs" style={{ color: theme.primary }}>
            {item.defaultPrice.toLocaleString('vi-VN')}đ
          </Text>
        </TouchableOpacity>
      );
    },
    [navigation, theme.foreground, theme.primary]
  );

  const renderEventItem = useCallback(
    ({ item }: { item: EventResponse }) => {
      const { month, day } = formatEventDate(item.startTime);

      return (
        <TouchableOpacity
          className="w-64 overflow-hidden rounded-2xl border shadow-sm"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
          onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}>
          <View className="relative h-36">
            <SmartImage uri={item.thumbnailUrl} className="h-full w-full object-cover" />

            <View className="absolute left-3 top-3 min-w-[45px] items-center rounded-xl bg-white p-1.5 shadow-lg dark:bg-slate-900">
              <Text className="mb-1 text-[10px] font-bold uppercase leading-none text-red-500">{month}</Text>
              <Text className="text-lg font-bold leading-none" style={{ color: theme.foreground }}>
                {day}
              </Text>
            </View>

            <View
              className="absolute right-3 top-3 rounded-lg px-2 py-0.5"
              style={{ backgroundColor: getStatusColor(item.status) }}>
              <Text className="text-[10px] font-bold uppercase text-white">{item.status}</Text>
            </View>
          </View>

          <View className="p-3">
            <Text className="text-md font-bold leading-tight" style={{ color: theme.foreground }} numberOfLines={1}>
              {item.name}
            </Text>
            <View className="mt-1 flex-row items-center gap-1">
              <Ionicons name="location-outline" size={14} color={theme.mutedForeground} />
              <Text className="text-xs" style={{ color: theme.mutedForeground }} numberOfLines={1}>
                {item.locationName || 'TBD'}
              </Text>
            </View>

            {item.tags && item.tags.length > 0 && (
              <View className="mt-2 flex-row flex-wrap gap-1">
                {item.tags.slice(0, 2).map((tag) => (
                  <View key={tag.id} className="rounded px-2 py-0.5" style={{ backgroundColor: tag.tagColor + '20' }}>
                    <Text className="text-[10px] font-semibold" style={{ color: tag.tagColor }}>
                      {tag.name}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {item.isTicketRequired && item.price != null && (
              <Text className="mt-1 text-xs font-bold" style={{ color: theme.primary }}>
                {item.price.toLocaleString('vi-VN')}đ
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [navigation, theme.border, theme.card, theme.foreground, theme.mutedForeground, theme.primary]
  );

  const renderBlogItem = useCallback(
    ({ item }: { item: (typeof BLOGS)[number] }) => (
      <TouchableOpacity className="w-80">
        <SmartImage uri={item.image} className="mb-3 h-44 w-full rounded-2xl object-cover shadow-sm" />
        <Text className="mb-1 text-lg font-bold leading-tight" style={{ color: theme.foreground }}>
          {item.title}
        </Text>
        <Text className="line-clamp-2 text-sm" style={{ color: theme.mutedForeground }}>
          {item.summary}
        </Text>
      </TouchableOpacity>
    ),
    [theme.foreground, theme.mutedForeground]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.allSettled([refetchAttractions(), refetchEvents(), refetchWorkshops()]).finally(() => setRefreshing(false));
  }, [refetchAttractions, refetchEvents, refetchWorkshops]);

  const renderHeader = () => (
    <View className="sticky top-0 bg-white/80 px-5 pb-1 pt-6 backdrop-blur-md dark:bg-slate-900/80">
      <Text className="text-3xl font-bold tracking-tight" style={{ color: theme.foreground }}>
        Discover
      </Text>
    </View>
  );

  const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll: () => void }) => (
    <View className="mb-4 mt-8 flex-row items-center justify-between px-5">
      <Text className="text-xl font-bold" style={{ color: theme.foreground }}>
        {title}
      </Text>
      <TouchableOpacity onPress={onSeeAll} className="flex-row items-center gap-1">
        <Text className="font-medium" style={{ color: theme.primary }}>
          See all
        </Text>
        <Ionicons name="arrow-forward" size={14} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
        {renderHeader()}

        {/* Popular Points (Using Attractions for now) */}
        <SectionHeader
          title="Popular Destinations"
          onSeeAll={() => navigation.navigate('AllDestinations', { initialTab: 'Points' })}
        />
        <View>
          {loading ? (
            <View
              className="mx-5 h-64 w-72 items-center justify-center rounded-2xl border bg-muted/20"
              style={{ borderColor: theme.border }}>
              <Ionicons name="refresh" size={24} color={theme.primary} className="animate-spin" />
            </View>
          ) : popularAttractions.length > 0 ? (
            <FlatList
              horizontal
              data={popularAttractions}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sectionListContainerStyle}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={renderHorizontalSpacer}
              renderItem={renderPopularDestinationItem}
            />
          ) : (
            <View
              className="mx-5 h-64 w-72 items-center justify-center rounded-2xl border bg-muted/20"
              style={{ borderColor: theme.border }}>
              <Text style={{ color: theme.mutedForeground }}>No destinations found</Text>
            </View>
          )}
        </View>

        {/* Workshops */}
        <SectionHeader
          title="Workshops"
          onSeeAll={() => navigation.navigate('AllDestinations', { initialTab: 'Workshops' })}
        />
        <View>
          {workshopsLoading ? (
            <View
              className="mx-5 h-52 w-44 items-center justify-center rounded-2xl border bg-muted/20"
              style={{ borderColor: theme.border }}>
              <Ionicons name="refresh" size={24} color={theme.primary} />
            </View>
          ) : discoverWorkshops.length > 0 ? (
            <FlatList
              horizontal
              data={discoverWorkshops}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sectionListContainerStyle}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={renderHorizontalSpacer}
              renderItem={renderWorkshopItem}
            />
          ) : (
            <View
              className="mx-5 h-52 w-44 items-center justify-center rounded-2xl border bg-muted/20"
              style={{ borderColor: theme.border }}>
              <Text style={{ color: theme.mutedForeground }}>No workshops found</Text>
            </View>
          )}
        </View>

        {/* Upcoming Events — from API */}
        <SectionHeader
          title="Upcoming Events"
          onSeeAll={() => navigation.navigate('AllDestinations', { initialTab: 'Events' })}
        />
        <View>
          {eventsLoading ? (
            <View
              className="mx-5 h-52 w-64 items-center justify-center rounded-2xl border bg-muted/20"
              style={{ borderColor: theme.border }}>
              <Ionicons name="refresh" size={24} color={theme.primary} className="animate-spin" />
            </View>
          ) : events.length > 0 ? (
            <FlatList
              horizontal
              data={events}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={sectionListContainerStyle}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={renderHorizontalSpacer}
              renderItem={renderEventItem}
            />
          ) : (
            <View
              className="mx-5 h-52 w-64 items-center justify-center rounded-2xl border bg-muted/20"
              style={{ borderColor: theme.border }}>
              <Ionicons name="calendar-outline" size={32} color={theme.mutedForeground} />
              <Text className="mt-2 text-sm" style={{ color: theme.mutedForeground }}>
                No upcoming events
              </Text>
            </View>
          )}
        </View>

        {/* Travel Blogs */}
        <SectionHeader
          title="Travel Blogs"
          onSeeAll={() => navigation.navigate('AllDestinations', { initialTab: 'Blogs' })}
        />
        <FlatList
          horizontal
          data={BLOGS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={sectionListContainerStyle}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={renderHorizontalSpacer}
          renderItem={renderBlogItem}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
