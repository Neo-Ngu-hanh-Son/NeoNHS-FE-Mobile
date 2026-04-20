import { ScrollView, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { StackScreenProps } from '@react-navigation/stack';
import { CompositeScreenProps } from '@react-navigation/native';

import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { useAuth } from '@/features/auth/context/AuthContext';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Ionicons } from '@expo/vector-icons';
//import { logger } from '@/utils/logger';
import { useTranslation } from 'react-i18next';

import { useBlogList } from '@/features/blog';
import useGuides from '../hooks/useGuides';
import useOverviews from '../hooks/useOverviews';
import useHomeEvents from '../hooks/useHomeEvents';
import useHomeDestinations from '../hooks/useHomeDestinations';
import useHomeWorkshops from '../hooks/useHomeWorkshops';
import useFeaturedBlog from '../hooks/useFeaturedBlog';
import { HomeHeader, SearchBar } from '../components';
import {
  ExploreSection,
  FeaturedSection,
  KnowBeforeYouGoSection,
  AboutNHSSection,
  LatestBlogsSection,
  UpcomingEventsSection,
  UpcomingWorkshopsSection,
  MustSeePlacesSection,
} from '../components/sections';

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;
export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { user } = useAuth();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);

  const {
    data: featuredBlog,
    isLoading: isFeaturedBlogLoading,
    isError: isFeaturedBlogError,
    refetch: refetchFeaturedBlog,
  } = useFeaturedBlog();
  const {
    data: guides,
    isLoading: guidesLoading,
    isError: guidesError,
    refetch: refetchGuides,
  } = useGuides();
  const {
    data: overviews,
    isLoading: overviewsLoading,
    isError: overviewsError,
    refetch: refetchOverviews,
  } = useOverviews();
  const {
    blogs,
    loading: blogsLoading,
    error: blogsError,
    refresh: refetchBlogs,
  } = useBlogList({
    size: 6,
    autoFetch: true,
  });
  const {
    data: homeEvents,
    isLoading: homeEventsLoading,
    isError: homeEventsError,
    refetch: refetchHomeEvents,
  } = useHomeEvents();
  const {
    data: homeWorkshops,
    isLoading: homeWorkshopsLoading,
    isError: homeWorkshopsError,
    refetch: refetchHomeWorkshops,
  } = useHomeWorkshops();
  const {
    data: destinations,
    isLoading: destinationsLoading,
    isError: destinationsError,
    refetch: refetchDestinations,
  } = useHomeDestinations();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    Promise.allSettled([
      refetchFeaturedBlog(),
      refetchBlogs(),
      refetchGuides(),
      refetchOverviews(),
      refetchHomeEvents(),
      refetchHomeWorkshops(),
      refetchDestinations(),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [
    refetchFeaturedBlog,
    refetchBlogs,
    refetchGuides,
    refetchOverviews,
    refetchHomeEvents,
    refetchHomeWorkshops,
    refetchDestinations,
  ]);

  function handleNotificationPress(): void {
    navigation.navigate('Main', { screen: 'Notifications', params: undefined } as any);
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
        bounces={false}
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

        <FeaturedSection
          loading={isFeaturedBlogLoading}
          featuredBlog={featuredBlog}
          error={isFeaturedBlogError}
        />

        <KnowBeforeYouGoSection guides={guides ?? []} loading={guidesLoading} error={guidesError} />

        <AboutNHSSection
          overviews={overviews ?? []}
          loading={overviewsLoading}
          error={overviewsError}
        />

        <LatestBlogsSection
          blogs={blogs ?? []}
          loading={blogsLoading}
          error={Boolean(blogsError)}
        />

        <UpcomingEventsSection
          events={homeEvents ?? []}
          loading={homeEventsLoading}
          error={homeEventsError}
        />

        <UpcomingWorkshopsSection
          workshops={homeWorkshops ?? []}
          loading={homeWorkshopsLoading}
          error={homeWorkshopsError}
        />

        <MustSeePlacesSection
          destinations={destinations ?? []}
          loading={destinationsLoading}
          error={destinationsError}
        />

        {/* Explore All Destinations Link */}
        <View className="mt-4 px-4">
          <Button variant="outline" className="w-full" onPress={handleExploreAllDestinations}>
            <Ionicons name="compass-outline" size={18} color={theme.foreground} />
            <Text className="ml-2 font-medium">{t('home.explore_all_destinations')}</Text>
          </Button>
        </View>

        {/* Bottom spacing */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
