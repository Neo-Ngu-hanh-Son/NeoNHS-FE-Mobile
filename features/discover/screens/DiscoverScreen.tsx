import { View, ScrollView, RefreshControl, Image, TouchableOpacity, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList, TabsStackParamList } from "@/app/navigations/NavigationParamTypes";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { discoverService } from "../services/discoverServices";
import { Attraction } from "../../map/types";

type DiscoverScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabsStackParamList, "Discover">,
  StackScreenProps<MainStackParamList>
>;

// --- Hierarchy Definitions ---
// Area (Destination) = Grouping (e.g., Marble Mountains)
// Point (Attraction) = Specific site (e.g., Huyen Khong Cave)

const WORKSHOPS = [
  {
    id: "w1",
    name: "Stone Carving Basics",
    category: "ART",
    rating: 4.5,
    reviews: 120,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCr-NjNNLRtozdgMDFmPTpHyuOUUGPO6f-8Wy4w86GQyNfka0cnI5wcAgSignl8A9L3UEzT8PrQTH1WCTJspHDGLr6O3EYHLL8_LmgaRBhqv0B0Je_zlL56xZT0c1OeBOF47wkjz5jixG4o0k61h72phCvXHmX-TgV8TV6g9lu_vMortFeOlraX0OxYvreRrGwC44OgorWcQALW9NAsP4-b7gYEpDDWqXcOnq8Z3cUyh7bsCGjcW0ZauziOtEppeCS570kIh-1MH1HI",
    color: "#10b981",
  },
  {
    id: "w2",
    name: "Traditional Pottery",
    category: "CRAFT",
    rating: 4.8,
    reviews: 85,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_uAmqAALLmD-bR-hrV_0QcfphnagxjcUkKF7f_PfSMebA3xJDP78ls9YAbVGdvJYqKFwU8EMrIe_DTXNAd7U3CAOTLXBGNapSE3vNLZ8bW0qqWBKNj3e0P9f2COUOXCQ9Z0P-GaVfvuqyugLI25hHPhnQhf_4BT9TvSxgVLb4EChY_QbaxS-UnCsccFZoiGUEyNQCuyqf2pZWX3uhFEAdKr-bhbgotdUwKIwoAhqYnS2c1RPt9lx3sgtHxVF2eQbZD_2CH-4dpnmW",
    color: "#3b82f6",
  },
  {
    id: "w3",
    name: "Silk Weaving",
    category: "TEXTILE",
    rating: 4.7,
    reviews: 42,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDszdZiFODZxVQ908Zv-_entgY4jqUzw1YeKHvOz0YacHl8lkhZ9A_Ot2KgLVYnXh9GFxxTkPF1ir2vqwWVsXRrX82d4mFc8JdEQtj0azBxWeaUBI_VS1jRdtF67vq0jKUKE0jidZb1DVOLNrCpk2mm6W56RDwdSLmHk7Nyg2o2hNjfmjV9nJ-vFUQ7garg1q8w7kPRTNUHP_5cGXSZyOVVQzegLh92Xs8HdOEzrO_d9phqPZ9Yf8946y76CaKDXMoQ-cFHSjUgUD5-",
    color: "#f97316",
  },
];

const EVENTS = [
  {
    id: "e1",
    name: "Avalokitesvara Festival",
    location: "Quan Am Pagoda",
    month: "Feb",
    day: "19",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAj0EbE0KnjIcdXnC06Fh8qgXR0hUm99aT0Xd4sZBVjsYB4PH5oNltpp9H7g3UT4Uupo-jdtPHrwVKGGBF3WEcAdJrbEJdIJ--K4_DVVxpr0STpRgQZaL3nGAsmESl-lRxJlUdOhjMUV0ZVrhQ9yFefFEu4Px2rpjcmQgZne4-pbny2IbO0YMuxP2Jiih_a--Dqm3PWxLepjlbFMxFjbcrhv_T3cexKY_XxDDOg2t_Ou6FpEPbTge-fSPu8zJcPLMVUWzVL9CHO0Szu",
  },
  {
    id: "e2",
    name: "Cultural Dance Night",
    location: "Non Nuoc Village",
    month: "Mar",
    day: "05",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCVvpDIm-tDyaXzCgMvpsPw2M9_SiB49K6Fbfv2JPvGeuJSyGxf-s1zJRy3bTQ7DZXwVytdJv3GooSJcKW0OA5T3l_oj1xHGGkcBqefXcDJ7EaGJp7lO-RoT-9_17SzZh1QH6tb7Yw0kYyLAKMpMtGKVq03HxkCk3VjxIovldHaQS63ZKCwU09AdvndR1b4QqbReNgi_kk0I6Elp3w470O5N1_8xdUZc0ElgrBS9LDHwyxqUB5vGMWg-OLFcF5dWIPnVy-pT96bA7a",
  },
];

const BLOGS = [
  {
    id: "b1",
    title: "Hidden Gems of the Water Mountain",
    summary: "Discover the secret paths and ancient shrines that most tourists miss when visiting...",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuALw1TtO_AXnQuuHWZAg9EknSOz0BWMEKDG1-OQ178gGYR88bedstWPlpr9s6QTxxC4qYy4yPcgk6z4to5PycLLwPqrcvlmK8_Rit_EghNJ3kmtjkqVd5MhHsoW-IcMiw8577bmTazb1mrXEoMrjXh6JG5pT1PK2jZY3wOA2GzRlPAmjM3IL9sH6sRV-daSkKwKDfvOXJoXbR2lR2sr_51wd6i2pEfLBbByZCVeTzWST9d9AqGng2aUYpSFxfvpUWTqjHH5gqpCGXTl",
  },
  {
    id: "b2",
    title: "A Guide to Buying Authentic Art",
    summary: "How to distinguish high-quality local crafts from mass-produced souvenirs in local markets...",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXe2ulX_LRYFncq9k4Nzsl7s9v5pbsBh9uvvgZi7uryfsJD4jY2b53ve_nMr_tyr0UxCci3RJc2h6cPiFlTqG6iS-Lwnc5sHuln79ardfp44ZxKav3ktIhlOLKJSKIZxivQtvtBkxt9kMGwwMKRpzjRg98RdyyM61aCQfhUQ9KDTuZHGv9L-wPcZ6utalJ00B8GDX9Gek4olN70eD-4lb3rbfG0tj_jSm9aLYd8-zEpRfHe5USsUgWwRyUB-pbuSolME7n1EW5GaER",
  },
];

export default function DiscoverScreen({ navigation }: DiscoverScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [refreshing, setRefreshing] = useState(false);
  const [popularAttractions, setPopularAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await discoverService.getAllAttractions();
      if (response.success && response.data) {
        setPopularAttractions(response.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Failed to fetch popular attractions:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const renderHeader = () => (
    <View className="px-5 pt-6 pb-1 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <Text className="text-3xl font-bold tracking-tight" style={{ color: theme.foreground }}>Discover</Text>
    </View>
  );

  const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll: () => void }) => (
    <View className="flex-row items-center justify-between px-5 mb-4 mt-8">
      <Text className="text-xl font-bold" style={{ color: theme.foreground }}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll} className="flex-row items-center gap-1">
        <Text className="font-medium" style={{ color: theme.primary }}>See all</Text>
        <Ionicons name="arrow-forward" size={14} color={theme.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      edges={["top"]}
    >
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
        }
      >
        {renderHeader()}

        {/* Popular Points (Using Attractions for now) */}
        <SectionHeader title="Popular Destinations" onSeeAll={() => navigation.navigate("AllDestinations", { initialTab: "Points" })} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
          {loading ? (
            <View className="w-72 h-64 items-center justify-center rounded-2xl border bg-muted/20" style={{ borderColor: theme.border }}>
              <Ionicons name="refresh" size={24} color={theme.primary} className="animate-spin" />
            </View>
          ) : popularAttractions.length > 0 ? (
            popularAttractions.map((attr) => (
              <TouchableOpacity
                key={attr.id}
                className="w-72 rounded-2xl overflow-hidden shadow-sm border"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
                onPress={() => navigation.navigate("AllDestinations", { initialTab: "Points", selectedAttractionId: attr.id })}
              >
                <View className="h-48 relative">
                  <Image source={{ uri: attr.thumbnailUrl || (attr as any).image }} className="w-full h-full object-cover" />
                  <View className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 px-2 py-1 rounded-lg flex-row items-center gap-1">
                    <Ionicons name="star" size={12} color="#eab308" />
                    <Text className="text-xs font-bold">4.8</Text>
                  </View>
                </View>
                <View className="p-4">
                  <Text className="font-bold text-lg" style={{ color: theme.foreground }}>{attr.name}</Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <Ionicons name="location-outline" size={14} color={theme.mutedForeground} />
                    <Text className="text-sm truncate pr-4" style={{ color: theme.mutedForeground }} numberOfLines={1}>{attr.address}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View className="w-72 h-64 items-center justify-center rounded-2xl border bg-muted/20" style={{ borderColor: theme.border }}>
              <Text style={{ color: theme.mutedForeground }}>No destinations found</Text>
            </View>
          )}
        </ScrollView>

        {/* Workshops */}
        <SectionHeader title="Workshops" onSeeAll={() => navigation.navigate("AllDestinations", { initialTab: "Workshops" })} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
          {WORKSHOPS.map((workshop) => (
            <TouchableOpacity key={workshop.id} className="w-44">
              <View className="relative w-44 h-44 rounded-2xl overflow-hidden mb-2">
                <Image source={{ uri: workshop.image }} className="w-full h-full object-cover" />
                <View
                  className="absolute bottom-3 left-3 px-2 py-0.5 rounded"
                  style={{ backgroundColor: workshop.color }}
                >
                  <Text className="text-white text-[10px] font-bold tracking-wider">{workshop.category}</Text>
                </View>
              </View>
              <Text className="font-bold text-sm leading-tight" style={{ color: theme.foreground }}>{workshop.name}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Ionicons name="star" size={12} color="#eab308" />
                <Text className="text-xs font-medium" style={{ color: theme.foreground }}>
                  {workshop.rating} <Text className="text-slate-400">({workshop.reviews} reviews)</Text>
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Upcoming Events */}
        <SectionHeader title="Upcoming Events" onSeeAll={() => navigation.navigate("AllDestinations", { initialTab: "Events" })} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
          {EVENTS.map((event) => (
            <TouchableOpacity
              key={event.id}
              className="w-64 rounded-2xl overflow-hidden shadow-sm border"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <View className="h-36 relative">
                <Image source={{ uri: event.image }} className="w-full h-full object-cover" />
                <View className="absolute top-3 left-3 bg-white dark:bg-slate-900 rounded-xl p-1.5 min-w-[45px] items-center shadow-lg">
                  <Text className="text-[10px] font-bold text-red-500 uppercase leading-none mb-1">{event.month}</Text>
                  <Text className="text-lg font-bold leading-none" style={{ color: theme.foreground }}>{event.day}</Text>
                </View>
              </View>
              <View className="p-3">
                <Text className="font-bold text-md leading-tight" style={{ color: theme.foreground }}>{event.name}</Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <Ionicons name="location-outline" size={14} color={theme.mutedForeground} />
                  <Text className="text-xs" style={{ color: theme.mutedForeground }}>{event.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Travel Blogs */}
        <SectionHeader title="Travel Blogs" onSeeAll={() => navigation.navigate("AllDestinations", { initialTab: "Blogs" })} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
          {BLOGS.map((blog) => (
            <TouchableOpacity key={blog.id} className="w-80">
              <Image source={{ uri: blog.image }} className="w-full h-44 rounded-2xl mb-3 shadow-sm object-cover" />
              <Text className="font-bold text-lg leading-tight mb-1" style={{ color: theme.foreground }}>{blog.title}</Text>
              <Text className="text-sm line-clamp-2" style={{ color: theme.mutedForeground }}>{blog.summary}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

