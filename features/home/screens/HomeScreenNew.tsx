import { ScrollView, View, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { CompositeScreenProps } from "@react-navigation/native";

import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { useAuth } from "@/features/auth/context/AuthContext";
import { RootStackParamList, TabsStackParamList } from "@/app/navigations/NavigationParamTypes";

import {
  HomeHeader,
  SearchBar,
  FeaturedEventCard,
  SectionHeader,
  GuideCard,
  DestinationCard,
  AboutCard,
} from "../components";

type HomeScreenNewProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, "Home">,
  StackScreenProps<RootStackParamList>
>;

// Static data for the home screen
const FEATURED_EVENT = {
  tag: "EVENT",
  title: "Lantern festival",
  description:
    "Discover this breathtaking event that is happening right now at NHS every weekends in a limited period!",
  imageUrl:
    "https://images.unsplash.com/photo-1602524816069-8ccc4c0cafee?w=800&q=80",
};

const GUIDES = [
  {
    id: "1",
    title: "Dress Code Guide",
    description: "Cultural etiquette for temples.",
    imageUrl:
      "https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400&q=80",
  },
  {
    id: "2",
    title: "Best Time to Visit",
    description: "Morning vs Evening pros & c...",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
  },
];

const DESTINATIONS = [
  {
    id: "1",
    title: "Huyen Khong Cave",
    subtitle: "Spiritual Cavern",
    imageUrl:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    size: "small" as const,
  },
  {
    id: "2",
    title: "Tam Thai Pagoda",
    subtitle: "Ancient Temple",
    imageUrl:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400&q=80",
    size: "small" as const,
  },
  {
    id: "3",
    title: "Non Nuoc Stone Village",
    subtitle: "Artisan Crafts & Heritage",
    imageUrl:
      "https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?w=400&q=80",
    size: "large" as const,
  },
];

const ABOUT_INFO = {
  tag: "ABOUT",
  title: "Ngu Hanh Son",
  description:
    "A masterpiece of landscape and spirituality, blending cave...",
  imageUrl:
    "https://images.unsplash.com/photo-1509439581779-6298f75bf6e5?w=400&q=80",
};

export default function HomeScreenNew({ navigation }: HomeScreenNewProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleNotificationPress = () => {
    // TODO: Navigate to notifications
  };

  const handleProfilePress = () => {
    // Navigate to profile tab
    navigation.navigate("Main", {
      screen: "Tabs",
      params: { screen: "Profile" },
    });
  };

  const handleSearchPress = () => {
    // TODO: Navigate to search screen
  };

  const handleEventPress = () => {
    // TODO: Navigate to event details
  };

  const handleGuidePress = (guideId: string) => {
    // TODO: Navigate to guide details
  };

  const handleDestinationPress = (destinationId: string) => {
    // TODO: Navigate to destination details
  };

  const handleAboutPress = () => {
    // TODO: Navigate to about screen
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      edges={["top"]}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
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

        {/* Happening Now Section */}
        <SectionHeader title="Happening now" />
        <FeaturedEventCard
          tag={FEATURED_EVENT.tag}
          title={FEATURED_EVENT.title}
          description={FEATURED_EVENT.description}
          imageUrl={FEATURED_EVENT.imageUrl}
          onPress={handleEventPress}
        />

        {/* Know Before You Go Section */}
        <SectionHeader title="Know Before You Go" showSeeAll />
        <View className="flex-row px-4 gap-4">
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

        {/* Popular & Must-See Section */}
        <SectionHeader title="Popular & Must-See" showSeeAll />
        <View className="px-4">
          {/* First row - 2 small cards */}
          <View className="flex-row gap-4 mb-4">
            {DESTINATIONS.filter((d) => d.size === "small").map((destination) => (
              <DestinationCard
                key={destination.id}
                title={destination.title}
                subtitle={destination.subtitle}
                imageUrl={destination.imageUrl}
                size="small"
                onPress={() => handleDestinationPress(destination.id)}
              />
            ))}
          </View>
          {/* Second row - 1 large card */}
          {DESTINATIONS.filter((d) => d.size === "large").map((destination) => (
            <View key={destination.id} className="mb-4">
              <DestinationCard
                title={destination.title}
                subtitle={destination.subtitle}
                imageUrl={destination.imageUrl}
                size="large"
                onPress={() => handleDestinationPress(destination.id)}
              />
            </View>
          ))}
        </View>

        {/* About Section */}
        <View className="mt-2">
          <AboutCard
            tag={ABOUT_INFO.tag}
            title={ABOUT_INFO.title}
            description={ABOUT_INFO.description}
            imageUrl={ABOUT_INFO.imageUrl}
            onPress={handleAboutPress}
          />
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}
