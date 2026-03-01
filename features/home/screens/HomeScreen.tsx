import { ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { CompositeScreenProps } from '@react-navigation/native';

import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useAuth } from '@/features/auth/context/AuthContext';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@/utils/logger';

import { useBlogList } from '@/features/blog';
import useGuides from '../hooks/useGuides';
import useOverviews from '../hooks/useOverviews';
import useHomeEvents from '../hooks/useHomeEvents';
import useHomeDestinations from '../hooks/useHomeDestinations';
import useFeaturedBlog from '../hooks/useFeaturedBlog';
import { HomeHeader, SearchBar } from '../components';
import {
  ExploreSection,
  FeaturedSection,
  KnowBeforeYouGoSection,
  AboutNHSSection,
  LatestBlogsSection,
  UpcomingEventsSection,
  MustSeePlacesSection,
} from '../components/sections';

type HomeScreen = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;
export default function HomeScreen({ navigation }: HomeScreen) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  // This one is for blogs
  const {
    blogs,
    loading: blogsLoading,
    refresh: refetchBlogs,
  } = useBlogList({
    size: 6,
  });

  const { loading: guidesLoading, guides, fetchGuides } = useGuides();
  const { loading: overviewsLoading, overviews, fetchOverviews } = useOverviews();
  const { loading: homeEventsLoading, homeEvents, fetchHomeEvents } = useHomeEvents();
  const { loading: destinationsLoading, destinations, fetchDestinations } = useHomeDestinations();
  const { loading: featuredLoading, featuredBlog, fetchfeaturedBlog } = useFeaturedBlog();

  useEffect(() => {
    void refetchBlogs();
  }, []);

  useEffect(() => {
    void fetchfeaturedBlog();
  }, []);

  useEffect(() => {
    void fetchGuides();
  }, []);

  useEffect(() => {
    void fetchOverviews();
  }, []);

  useEffect(() => {
    void fetchHomeEvents();
  }, []);

  useEffect(() => {
    void fetchDestinations();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchBlogs(),
        fetchfeaturedBlog(),
        fetchGuides(),
        fetchOverviews(),
        fetchHomeEvents(),
        fetchDestinations(),
      ]);
    } catch (error) {
      logger.error('Error refreshing home sections:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    refetchBlogs,
    fetchfeaturedBlog,
    fetchGuides,
    fetchOverviews,
    fetchHomeEvents,
    fetchDestinations,
  ]);

  function handleNotificationPress(): void {
    logger.info('Notifications pressed on Home');
  }

  function handleProfilePress(): void {
    navigation.navigate('Profile');
  }

  function handleSearchPress(): void {
    navigation.navigate('Main', { screen: 'AllDestinations', params: {} });
  }

  function handleExploreAllDestinations(): void {
    navigation.navigate('Main', { screen: 'AllDestinations', params: {} });
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }>
        {/* Header */}
        <HomeHeader
          onNotificationPress={handleNotificationPress}
          onProfilePress={handleProfilePress}
          userAvatar={user?.avatarUrl ?? undefined}
        />

        {/* Search Bar */}
        <View className="mt-2">
          <SearchBar onPress={handleSearchPress} />
        </View>

        <ExploreSection />

        <FeaturedSection loading={featuredLoading} featuredBlog={featuredBlog} />

        <KnowBeforeYouGoSection guides={guides} loading={guidesLoading} />

        <AboutNHSSection overviews={overviews} loading={overviewsLoading} />

        <LatestBlogsSection blogs={blogs} loading={blogsLoading} />

        <UpcomingEventsSection events={homeEvents} loading={homeEventsLoading} />

        <MustSeePlacesSection destinations={destinations} loading={destinationsLoading} />

        {/* Explore All Destinations Link */}
        <View className="mt-4 px-4">
          <Button variant="outline" className="w-full" onPress={handleExploreAllDestinations}>
            <Ionicons name="compass-outline" size={18} color={theme.foreground} />
            <Text className="ml-2 font-medium">Explore All Destinations</Text>
          </Button>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
