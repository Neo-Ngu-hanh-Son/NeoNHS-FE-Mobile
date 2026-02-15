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

import {
  HomeHeader,
  SearchBar,
  FeaturedEventCard,
  SectionHeader,
  GuideCard,
  ExperienceCard,
  PlaceCard,
  HighlightCard,
} from '../components';
import axios from 'axios';
import { logger } from '@/utils/logger';
import { apiClient } from '@/services/api';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';

type HomeScreenNewProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

// ============================================
// SECTION 1: Hero / Pinned Editorial
// ============================================
const HERO_CONTENT = {
  tag: 'FEATURED',
  title: 'Welcome to Ngu Hanh Son',
  description:
    'Discover the Marble Mountains - a cluster of five marble and limestone hills with caves, tunnels, and Buddhist sanctuaries.',
  imageUrl: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&q=80',
};

// ============================================
// SECTION 3: Helpful & Informational Blogs
// "Know Before You Go" / "Getting Started"
// ============================================
const GUIDES = [
  {
    id: '1',
    title: 'Hidden Gems of the Water Mountain',
    description: 'Discover the secret paths and ancient shrines that most tourists miss when...',
    imageUrl: 'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400&q=80',
  },
  {
    id: '2',
    title: 'A Guide to Buying Authentic Art',
    description: 'How to distinguish high-quality crafts from mass-produced souvenirs...',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    id: '3',
    title: 'Cultural Tips & Temple Etiquette',
    description: 'Learn about dress codes, customs, and how to be a respectful visitor...',
    imageUrl: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=400&q=80',
  },
  {
    id: '4',
    title: 'Best Times to Visit NHS',
    description: 'Morning vs evening, seasonal tips, and avoiding the crowds...',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  },
];

// ============================================
// SECTION 4: Highlights About Ngu Hanh Son
// ============================================
const HIGHLIGHTS = [
  {
    id: '1',
    title: 'History of the Marble Mountains',
    description:
      'Dating back centuries, these five peaks represent the five elements of the universe: metal, wood, water, fire, and earth.',
    imageUrl: 'https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=400&q=80',
  },
  {
    id: '2',
    title: 'Cultural & Spiritual Significance',
    description:
      'Home to numerous Buddhist pagodas and Hindu grottos, these mountains have been a pilgrimage site for centuries.',
    imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80',
  },
];

// ============================================
// SECTION 5: Popular Experiences (Preview)
// "Popular Right Now"
// ============================================
const EXPERIENCES = [
  {
    id: '1',
    title: 'Stone Carving Workshop',
    tag: 'Workshop' as const,
    imageUrl: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=400&q=80',
  },
  {
    id: '2',
    title: 'Lantern Festival Night',
    tag: 'Event' as const,
    imageUrl: 'https://images.unsplash.com/photo-1602524816069-8ccc4c0cafee?w=400&q=80',
  },
  {
    id: '3',
    title: 'Sunrise Meditation Tour',
    tag: 'Tour' as const,
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  },
  {
    id: '4',
    title: 'Traditional Art Class',
    tag: 'Workshop' as const,
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80',
  },
];

// ============================================
// SECTION 6: Featured Destinations
// "Must-See Places"
// ============================================
const DESTINATIONS = [
  {
    id: '1',
    name: 'Huyen Khong Cave',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  },
  {
    id: '2',
    name: 'Tam Thai Pagoda',
    imageUrl: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80',
  },
  {
    id: '3',
    name: 'Linh Ung Pagoda',
    imageUrl: 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=400&q=80',
  },
  {
    id: '4',
    name: 'Am Phu Cave',
    imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400&q=80',
  },
  {
    id: '5',
    name: 'Non Nuoc Stone Village',
    imageUrl: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=400&q=80',
  },
];

export default function HomeScreenNew({ navigation }: HomeScreenNewProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  // Navigation handlers
  const handleNotificationPress = () => {
    // TODO: Navigate to notifications
  };

  const handleProfilePress = () => {
    navigation.navigate('Main', {
      screen: 'Tabs',
      params: { screen: 'Profile' },
    });
  };

  const handleSearchPress = () => {
    // TODO: Navigate to search screen
  };

  const handleHeroPress = () => {
    // TODO: Navigate to introduction page
  };

  const handleGuidePress = (guideId: string) => {
    // TODO: Navigate to blog/guide details
  };

  const handleViewAllBlogs = () => {
    // TODO: Navigate to blogs list
  };

  const handleHighlightPress = (highlightId: string) => {
    // TODO: Navigate to highlight details
  };

  const handleExperiencePress = (experienceId: string) => {
    // TODO: Navigate to experience details
  };

  const handleSeeMoreExperiences = () => {
    // TODO: Navigate to Discover tab
  };

  const handlePlacePress = (placeId: string) => {
    // TODO: Navigate to destination details
  };

  const handleExploreAllDestinations = () => {
    // TODO: Navigate to Discover tab
  };

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

        {/* ============================================ */}
        {/* SECTION 1: Hero / Pinned Editorial */}
        {/* ============================================ */}
        <SectionHeader title="Featured" />
        <FeaturedEventCard
          tag={HERO_CONTENT.tag}
          title={HERO_CONTENT.title}
          description={HERO_CONTENT.description}
          imageUrl={HERO_CONTENT.imageUrl}
          onPress={handleHeroPress}
        />

        {/* ============================================ */}
        {/* SECTION 3: Helpful & Informational Blogs */}
        {/* "Know Before You Go" */}
        {/* ============================================ */}
        <SectionHeader title="Know Before You Go" showSeeAll onSeeAllPress={handleViewAllBlogs} />
        <View className="flex-row flex-wrap gap-4 px-4">
          {GUIDES.map((guide) => (
            <GuideCard
              key={guide.id}
              title={guide.title}
              description={guide.description}
              imageUrl={guide.imageUrl}
              onPress={() => handleGuidePress(guide.id)}
            />
          ))}
        </View>

        {/* ============================================ */}
        {/* SECTION 4: Highlights About Ngu Hanh Son */}
        {/* ============================================ */}
        <SectionHeader title="About Ngu Hanh Son" />
        <View className="gap-3">
          {HIGHLIGHTS.map((highlight) => (
            <HighlightCard
              key={highlight.id}
              title={highlight.title}
              description={highlight.description}
              imageUrl={highlight.imageUrl}
              linkText="Learn More"
              onPress={() => handleHighlightPress(highlight.id)}
            />
          ))}
        </View>

        {/* ============================================ */}
        {/* SECTION 5: Popular Experiences (Preview) */}
        {/* "Popular Right Now" */}
        {/* ============================================ */}
        <SectionHeader
          title="Popular Right Now"
          showSeeAll
          onSeeAllPress={handleSeeMoreExperiences}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}>
          {EXPERIENCES.map((experience) => (
            <ExperienceCard
              key={experience.id}
              title={experience.title}
              tag={experience.tag}
              imageUrl={experience.imageUrl}
              onPress={() => handleExperiencePress(experience.id)}
            />
          ))}
        </ScrollView>

        {/* ============================================ */}
        {/* SECTION 6: Featured Destinations */}
        {/* "Must-See Places" */}
        {/* ============================================ */}
        <SectionHeader
          title="Must-See Places"
          showSeeAll
          onSeeAllPress={handleExploreAllDestinations}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}>
          {DESTINATIONS.map((place) => (
            <PlaceCard
              key={place.id}
              name={place.name}
              imageUrl={place.imageUrl}
              onPress={() => handlePlacePress(place.id)}
            />
          ))}
        </ScrollView>

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
