import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { eventService } from "../services/eventService";
import { EventResponse, TicketCatalogResponse } from "../types";
import { EventImageGallery, EventInfoSection, TicketCatalogList } from "../components";

type Props = StackScreenProps<MainStackParamList, "EventDetail">;

export default function EventDetailScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [event, setEvent] = useState<EventResponse | null>(null);
  const [tickets, setTickets] = useState<TicketCatalogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "tickets">("info");

  // ── Data fetching ──

  const fetchEventDetail = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventService.getEventById(eventId);
      if (response.success && response.data) {
        setEvent(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch event detail:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  const fetchTicketCatalogs = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const response = await eventService.getTicketCatalogs(eventId);
      if (response.success && response.data) {
        setTickets(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch ticket catalogs:", error);
    } finally {
      setTicketsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEventDetail();
  }, [fetchEventDetail]);

  useEffect(() => {
    if (activeTab === "tickets" && tickets.length === 0) {
      fetchTicketCatalogs();
    }
  }, [activeTab, fetchTicketCatalogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEventDetail();
    if (activeTab === "tickets") {
      fetchTicketCatalogs();
    }
  }, [fetchEventDetail, fetchTicketCatalogs, activeTab]);

  // ── Buy ticket handler (placeholder for future implementation) ──

  const handleBuyTicket = useCallback((ticket: TicketCatalogResponse) => {
    // TODO: Implement actual buy/add-to-cart logic
    Alert.alert(
      "Buy Ticket",
      `You selected "${ticket.name}" — ${ticket.price.toLocaleString("vi-VN")}đ.\n\nThis feature will be available soon!`,
      [{ text: "OK" }]
    );
  }, []);

  // ── Loading state ──

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text className="mt-3 text-sm" style={{ color: theme.mutedForeground }}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  if (!event) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
        edges={["top"]}
      >
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={theme.mutedForeground}
        />
        <Text className="mt-3 text-lg font-bold" style={{ color: theme.foreground }}>
          Event not found
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 px-6 py-2 rounded-full"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Render ──

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      edges={["top"]}
    >
      {/* Header */}
      <View
        className="px-4 py-3 flex-row items-center justify-between border-b"
        style={{ borderColor: theme.border }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 -ml-2"
        >
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold flex-1 ml-2"
          style={{ color: theme.foreground }}
          numberOfLines={1}
        >
          {event.name}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Image Gallery */}
        <EventImageGallery
          images={event.images}
          thumbnailUrl={event.thumbnailUrl}
          primaryColor={theme.primary}
          mutedColor={theme.muted}
        />

        {/* Event Info (title, status, date, location, participants, price, tags) */}
        <EventInfoSection event={event} theme={theme} />

        {/* Tabs */}
        <View className="flex-row px-5 mt-6 gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab("info")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "info" ? "bg-primary" : ""
            }`}
            style={
              activeTab !== "info"
                ? { backgroundColor: theme.muted }
                : undefined
            }
          >
            <Text
              className={`font-bold text-sm ${
                activeTab === "info" ? "text-white" : ""
              }`}
              style={activeTab !== "info" ? { color: theme.mutedForeground } : undefined}
            >
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("tickets")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "tickets" ? "bg-primary" : ""
            }`}
            style={
              activeTab !== "tickets"
                ? { backgroundColor: theme.muted }
                : undefined
            }
          >
            <Text
              className={`font-bold text-sm ${
                activeTab === "tickets" ? "text-white" : ""
              }`}
              style={
                activeTab !== "tickets"
                  ? { color: theme.mutedForeground }
                  : undefined
              }
            >
              Buy Tickets
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className="px-5 mt-4">
          {activeTab === "info" ? (
            <View>
              {event.fullDescription ? (
                <Text
                  className="text-sm leading-6"
                  style={{ color: theme.foreground }}
                >
                  {event.fullDescription}
                </Text>
              ) : (
                <Text
                  className="text-sm italic"
                  style={{ color: theme.mutedForeground }}
                >
                  No detailed description available.
                </Text>
              )}
            </View>
          ) : (
            <TicketCatalogList
              tickets={tickets}
              loading={ticketsLoading}
              theme={theme}
              onBuyPress={handleBuyTicket}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
