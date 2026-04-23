import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";
import { CommonActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/app/providers/ThemeProvider";
import { useAuth } from "@/features/auth/context/AuthContext";
import { THEME } from "@/lib/theme";
import { TabsStackParamList, RootStackParamList } from "@/app/navigations/NavigationParamTypes";
import { CompositeScreenProps } from "@react-navigation/native";

type BookingsScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, "Bookings">,
  StackScreenProps<RootStackParamList>
>;

// Placeholder bookings
const SAMPLE_BOOKINGS = [
  {
    id: "1",
    title: "Stone Carving Workshop",
    date: "Feb 15, 2026",
    time: "10:00 AM",
    status: "upcoming",
    type: "Workshop",
  },
  {
    id: "2",
    title: "Sunrise Meditation Tour",
    date: "Feb 20, 2026",
    time: "5:30 AM",
    status: "upcoming",
    type: "Tour",
  },
];

export default function BookingsScreen({ navigation }: BookingsScreenProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "Auth", params: { screen: "Login" } }],
      })
    );
  };

  // Guest View
  if (!isAuthenticated) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
        edges={["top"]}
      >
        <View className="px-4 py-4">
          <Text className="text-2xl font-bold" style={{ color: theme.foreground }}>
            {t('bookings.title')}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: theme.muted }}
          >
            <Ionicons name="calendar-outline" size={48} color={theme.mutedForeground} />
          </View>
          <Text
            className="text-xl font-semibold text-center"
            style={{ color: theme.foreground }}
          >
            {t('bookings.guest_title')}
          </Text>
          <Text
            className="text-base text-center mt-2"
            style={{ color: theme.mutedForeground }}
          >
            {t('bookings.guest_subtitle')}
          </Text>
          <Button className="mt-6" onPress={handleLogin}>
            <Ionicons name="log-in-outline" size={20} color={theme.primaryForeground} />
            <Text className="ml-2 font-semibold" style={{ color: theme.primaryForeground }}>
              {t('common.sign_in')}
            </Text>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Authenticated View
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
            {t('bookings.title')}
          </Text>
          <Text className="text-base mt-1" style={{ color: theme.mutedForeground }}>
            {t('bookings.subtitle')}
          </Text>
        </View>

        {/* Tab Buttons */}
        <View className="flex-row px-4 gap-3 mb-4">
          <Button
            variant={activeTab === "upcoming" ? "default" : "outline"}
            className="flex-1"
            onPress={() => setActiveTab("upcoming")}
          >
            <Text
              className="font-medium"
              style={{
                color: activeTab === "upcoming" ? theme.primaryForeground : theme.foreground,
              }}
            >
              {t('bookings.tabs.upcoming')}
            </Text>
          </Button>
          <Button
            variant={activeTab === "past" ? "default" : "outline"}
            className="flex-1"
            onPress={() => setActiveTab("past")}
          >
            <Text
              className="font-medium"
              style={{
                color: activeTab === "past" ? theme.primaryForeground : theme.foreground,
              }}
            >
              {t('bookings.tabs.past')}
            </Text>
          </Button>
        </View>

        {/* Bookings List */}
        {activeTab === "upcoming" && SAMPLE_BOOKINGS.length > 0 ? (
          <View className="px-4 gap-3">
            {SAMPLE_BOOKINGS.map((booking) => (
              <Card key={booking.id} className="p-4 gap-3">
                <View className="flex-row items-center justify-between">
                  <View
                    className="px-2 py-1 rounded"
                    style={{ backgroundColor: theme.primary + "20" }}
                  >
                    <Text className="text-xs font-medium" style={{ color: theme.primary }}>
                      {booking.type}
                    </Text>
                  </View>
                  <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                    {booking.status.toUpperCase()}
                  </Text>
                </View>
                <Text className="text-base font-semibold" style={{ color: theme.foreground }}>
                  {booking.title}
                </Text>
                <View className="flex-row items-center gap-4">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="calendar-outline" size={14} color={theme.mutedForeground} />
                    <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                      {booking.date}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={14} color={theme.mutedForeground} />
                    <Text className="text-sm" style={{ color: theme.mutedForeground }}>
                      {booking.time}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-16 px-8">
            <Ionicons name="calendar-outline" size={48} color={theme.mutedForeground} />
            <Text
              className="text-lg font-semibold mt-4"
              style={{ color: theme.foreground }}
            >
              {t('bookings.empty_title', { tab: activeTab })}
            </Text>
            <Text
              className="text-sm text-center mt-1"
              style={{ color: theme.mutedForeground }}
            >
              {activeTab === "upcoming"
                ? t('bookings.empty_upcoming')
                : t('bookings.empty_past')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
