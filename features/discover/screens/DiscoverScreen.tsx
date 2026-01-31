import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { TabsStackParamList } from "@/app/navigations/NavigationParamTypes";

type DiscoverScreenProps = StackScreenProps<TabsStackParamList, "Discover">;

// Placeholder categories
const CATEGORIES = [
  { id: "1", name: "Temples", icon: "business-outline" as const, count: 12 },
  { id: "2", name: "Caves", icon: "bonfire-outline" as const, count: 8 },
  { id: "3", name: "Pagodas", icon: "leaf-outline" as const, count: 15 },
  { id: "4", name: "Villages", icon: "home-outline" as const, count: 5 },
  { id: "5", name: "Events", icon: "calendar-outline" as const, count: 7 },
  { id: "6", name: "Workshops", icon: "color-palette-outline" as const, count: 10 },
];

export default function DiscoverScreen({ navigation }: DiscoverScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      edges={["top"]}
    >
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
        }
      >
        {/* Header */}
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>
            Discover
          </Text>
          <Text className="text-base mt-1" style={{ color: theme.mutedForeground }}>
            Explore destinations, events, and experiences
          </Text>
        </View>

        {/* Search Bar Placeholder */}
        <View
          className="mx-4 px-4 py-3 rounded-xl border flex-row items-center gap-3"
          style={{ backgroundColor: theme.card, borderColor: theme.border }}
        >
          <Ionicons name="search" size={20} color={theme.mutedForeground} />
          <Text style={{ color: theme.mutedForeground }}>
            Search places, events...
          </Text>
        </View>

        {/* Categories Grid */}
        <Text
          className="text-lg font-semibold px-4 mt-6 mb-3"
          style={{ color: theme.foreground }}
        >
          Browse by Category
        </Text>
        <View className="flex-row flex-wrap px-4 gap-3">
          {CATEGORIES.map((category) => (
            <View
              key={category.id}
              className="w-[30%] rounded-xl p-4 items-center"
              style={{ backgroundColor: theme.card }}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: theme.muted }}
              >
                <Ionicons name={category.icon} size={24} color={theme.primary} />
              </View>
              <Text
                className="text-sm font-medium text-center"
                style={{ color: theme.foreground }}
              >
                {category.name}
              </Text>
              <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                {category.count} places
              </Text>
            </View>
          ))}
        </View>

        {/* Coming Soon Section */}
        <View className="mx-4 mt-6 p-6 rounded-xl items-center" style={{ backgroundColor: theme.muted }}>
          <Ionicons name="compass-outline" size={48} color={theme.primary} />
          <Text
            className="text-lg font-semibold mt-3"
            style={{ color: theme.foreground }}
          >
            More Coming Soon
          </Text>
          <Text
            className="text-sm text-center mt-1"
            style={{ color: theme.mutedForeground }}
          >
            We're adding new destinations and experiences. Stay tuned!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
