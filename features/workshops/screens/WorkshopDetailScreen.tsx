import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StackScreenProps } from "@react-navigation/stack";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { MainStackParamList } from "@/app/navigations/NavigationParamTypes";
import { WorkshopTemplateResponse, WorkshopSessionResponse } from "../types";
import {
  WorkshopImageGallery,
  WorkshopInfoSection,
  WorkshopSessionList,
} from "../components";
import { MOCK_WORKSHOP_TEMPLATES, MOCK_WORKSHOP_SESSIONS } from "../data/mockData";

type Props = StackScreenProps<MainStackParamList, "WorkshopDetail">;

export default function WorkshopDetailScreen({ navigation, route }: Props) {
  const { workshopId } = route.params;
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const [workshop, setWorkshop] = useState<WorkshopTemplateResponse | null>(null);
  const [sessions, setSessions] = useState<WorkshopSessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "sessions">("info");

  const fetchWorkshopDetail = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const found = MOCK_WORKSHOP_TEMPLATES.find((w) => w.id === workshopId) || null;
      setWorkshop(found);
      setLoading(false);
      setRefreshing(false);
    }, 400);
  }, [workshopId]);

  const fetchSessions = useCallback(() => {
    setSessionsLoading(true);
    setTimeout(() => {
      const data = MOCK_WORKSHOP_SESSIONS[workshopId] || [];
      setSessions(data);
      setSessionsLoading(false);
    }, 500);
  }, [workshopId]);

  useEffect(() => {
    fetchWorkshopDetail();
  }, [fetchWorkshopDetail]);

  useEffect(() => {
    if (activeTab === "sessions" && sessions.length === 0) {
      fetchSessions();
    }
  }, [activeTab, fetchSessions, sessions.length]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWorkshopDetail();
    if (activeTab === "sessions") {
      fetchSessions();
    }
  }, [fetchWorkshopDetail, fetchSessions, activeTab]);

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
        edges={["top"]}
      >
        <ActivityIndicator size="large" color={theme.primary} />
        <Text className="mt-3 text-sm" style={{ color: theme.mutedForeground }}>
          Loading workshop...
        </Text>
      </SafeAreaView>
    );
  }

  if (!workshop) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: theme.background }}
        edges={["top"]}
      >
        <Ionicons name="alert-circle-outline" size={48} color={theme.mutedForeground} />
        <Text className="mt-3 text-lg font-bold" style={{ color: theme.foreground }}>
          Workshop not found
        </Text>
        <Text className="mt-1 text-sm text-center px-10" style={{ color: theme.mutedForeground }}>
          This workshop may no longer be available.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 px-6 py-2.5 rounded-full"
          style={{ backgroundColor: theme.primary }}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color={theme.foreground} />
        </TouchableOpacity>
        <Text
          className="text-lg font-bold flex-1 ml-2"
          style={{ color: theme.foreground }}
          numberOfLines={1}
        >
          {workshop.name}
        </Text>
        <TouchableOpacity className="p-2 -mr-2">
          <Ionicons name="share-outline" size={22} color={theme.foreground} />
        </TouchableOpacity>
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
        <WorkshopImageGallery
          images={workshop.images}
          primaryColor={theme.primary}
          mutedColor={theme.muted}
        />

        {/* Info Section */}
        <WorkshopInfoSection workshop={workshop} theme={theme} />

        {/* Tabs */}
        <View className="flex-row px-5 mt-6 gap-2">
          <TouchableOpacity
            onPress={() => setActiveTab("info")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "info" ? "bg-primary" : ""
            }`}
            style={activeTab !== "info" ? { backgroundColor: theme.muted } : undefined}
          >
            <Text
              className={`font-bold text-sm ${activeTab === "info" ? "text-white" : ""}`}
              style={activeTab !== "info" ? { color: theme.mutedForeground } : undefined}
            >
              Details
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab("sessions")}
            className={`flex-1 py-3 rounded-xl items-center ${
              activeTab === "sessions" ? "bg-primary" : ""
            }`}
            style={activeTab !== "sessions" ? { backgroundColor: theme.muted } : undefined}
          >
            <Text
              className={`font-bold text-sm ${activeTab === "sessions" ? "text-white" : ""}`}
              style={activeTab !== "sessions" ? { color: theme.mutedForeground } : undefined}
            >
              Book Sessions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View className="px-5 mt-4">
          {activeTab === "info" ? (
            <View>
              <Text
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: theme.mutedForeground }}
              >
                About this workshop
              </Text>
              {workshop.fullDescription ? (
                <Text className="text-sm leading-6" style={{ color: theme.foreground }}>
                  {workshop.fullDescription}
                </Text>
              ) : (
                <Text className="text-sm italic" style={{ color: theme.mutedForeground }}>
                  No detailed description available.
                </Text>
              )}

              {/* What's included */}
              <Text
                className="text-xs font-bold uppercase tracking-wider mt-6 mb-3"
                style={{ color: theme.mutedForeground }}
              >
                What's included
              </Text>
              <View className="gap-2.5">
                {[
                  { icon: "checkmark-circle" as const, text: "All materials and equipment" },
                  { icon: "checkmark-circle" as const, text: "Expert instructor guidance" },
                  { icon: "checkmark-circle" as const, text: "Refreshments provided" },
                  { icon: "checkmark-circle" as const, text: "Certificate of completion" },
                ].map((item, idx) => (
                  <View key={idx} className="flex-row items-center gap-2.5">
                    <Ionicons name={item.icon} size={18} color={theme.primary} />
                    <Text className="text-sm" style={{ color: theme.foreground }}>
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <WorkshopSessionList
              sessions={sessions}
              loading={sessionsLoading}
              theme={theme}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
