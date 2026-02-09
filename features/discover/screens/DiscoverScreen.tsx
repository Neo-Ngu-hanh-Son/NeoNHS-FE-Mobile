import { View, ScrollView, RefreshControl, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { TabsStackParamList } from "@/app/navigations/NavigationParamTypes";

type DiscoverScreenProps = StackScreenProps<TabsStackParamList, "Discover">;

// --- Mock Types based on Java Entities ---

export enum EventStatus {
  UPCOMING = "UPCOMING",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum TicketCatalogStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface TicketCatalog {
  id: string;
  name: string;
  description?: string;
  customerType?: string;
  price: number;
  originalPrice?: number;
  applyOnDays?: string;
  validFromDate?: string;
  validToDate?: string;
  totalQuota?: number;
  status: TicketCatalogStatus;
}

export interface Event {
  id: string;
  name: string;
  shortDescription?: string;
  fullDescription?: string;
  locationName?: string;
  latitude?: string;
  longitude?: string;
  startTime: string;
  endTime: string;
  isTicketRequired: boolean;
  price?: number; // Base price or starting price
  maxParticipants?: number;
  currentEnrolled: number;
  status: EventStatus;
  ticketCatalogs: TicketCatalog[];
}

// --- Mock Data ---

const MOCK_EVENT: Event = {
  id: "e1-uuid-1234-5678",
  name: "Danang International Fireworks Festival 2026",
  shortDescription: "The biggest fireworks festival in Vietnam.",
  fullDescription:
    "Join us for a spectacular display of lights and colors at the annual Danang International Fireworks Festival. Featuring teams from 8 countries, this event promises unforgettable nights by the Han River.",
  locationName: "Han River Port, Danang",
  startTime: "2026-06-08T19:00:00",
  endTime: "2026-06-08T22:00:00",
  isTicketRequired: true,
  price: 500000,
  maxParticipants: 10000,
  currentEnrolled: 1500,
  status: EventStatus.UPCOMING,
  ticketCatalogs: [
    {
      id: "tc-1",
      name: "Standard Stand A",
      description: "General admission for Stand A.",
      price: 500000,
      originalPrice: 600000,
      totalQuota: 500,
      status: TicketCatalogStatus.ACTIVE,
    },
    {
      id: "tc-2",
      name: "VIP Stand B",
      description: "VIP seat with best view and snacks.",
      price: 1200000,
      originalPrice: 1500000,
      totalQuota: 100,
      status: TicketCatalogStatus.ACTIVE,
    },
  ],
};

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

  const handleBuyTicket = (event: Event) => {
    // Fake API call test
    console.log("Testing Buy Ticket API for Event:", event.id);
    console.log("Available catalogs:", event.ticketCatalogs);
    Alert.alert("API Test", `Initiating purchase for: ${event.name}`);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "Free";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          <Text style={{ color: theme.mutedForeground }}>Search places, events...</Text>
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

        {/* Featured Event (Mock Data) */}
        <Text
          className="text-lg font-semibold px-4 mt-8 mb-3"
          style={{ color: theme.foreground }}
        >
          Featured Event (Test)
        </Text>
        <View className="px-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>{MOCK_EVENT.name}</CardTitle>
              <CardDescription>{MOCK_EVENT.shortDescription}</CardDescription>
            </CardHeader>
            <CardContent>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="location-outline" size={16} color={theme.mutedForeground} />
                  <Text className="text-sm">{MOCK_EVENT.locationName}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="time-outline" size={16} color={theme.mutedForeground} />
                  <Text className="text-sm">{formatDate(MOCK_EVENT.startTime)}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Ionicons name="ticket-outline" size={16} color={theme.mutedForeground} />
                  <Text className="text-sm font-semibold">
                    From {formatCurrency(MOCK_EVENT.price)}
                  </Text>
                </View>

                {/* Ticket Types Types Preview */}
                <View className="mt-2 p-3 bg-muted/20 rounded-lg">
                  <Text className="text-xs font-semibold mb-2">Available Tickets:</Text>
                  {MOCK_EVENT.ticketCatalogs.map((ticket) => (
                    <View key={ticket.id} className="flex-row justify-between mb-1">
                      <Text className="text-xs text-muted-foreground">{ticket.name}</Text>
                      <Text className="text-xs font-medium">
                        {formatCurrency(ticket.price)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                className="w-full"
                onPress={() => handleBuyTicket(MOCK_EVENT)}
              >
                <Text className="text-white font-bold">Buy Ticket (Test API)</Text>
              </Button>
            </CardFooter>
          </Card>
        </View>

        {/* Coming Soon Section */}
        <View
          className="mx-4 mt-6 p-6 rounded-xl items-center"
          style={{ backgroundColor: theme.muted }}
        >
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
