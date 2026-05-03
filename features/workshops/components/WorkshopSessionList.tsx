import React from "react";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { WorkshopSessionResponse } from "../types";
import WorkshopSessionCard from "./WorkshopSessionCard";

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  border: string;
  card: string;
  muted: string;
}

interface WorkshopSessionListProps {
  sessions: WorkshopSessionResponse[];
  loading: boolean;
  theme: ThemeColors;
}

export default function WorkshopSessionList({
  sessions,
  loading,
  theme,
}: WorkshopSessionListProps) {
  if (loading) {
    return (
      <View className="py-10 items-center">
        <ActivityIndicator size="small" color={theme.primary} />
        <Text className="mt-2 text-sm" style={{ color: theme.mutedForeground }}>
          Đang tải ...
        </Text>
      </View>
    );
  }

  if (sessions.length === 0) {
    return (
      <View className="py-10 items-center">
        <Ionicons name="calendar-outline" size={40} color={theme.mutedForeground} />
        <Text className="mt-3 text-sm font-semibold" style={{ color: theme.foreground }}>
          Không có lịch workshop.
        </Text>
        <Text className="mt-1 text-xs text-center px-8" style={{ color: theme.mutedForeground }}>
          Vui lòng kiểm tra lại sau.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Text className="text-xs" style={{ color: theme.mutedForeground }}>
        {sessions.length} lịch workshop{sessions.length !== 1 ? "s" : ""}
      </Text>
      {sessions.map((session) => (
        <WorkshopSessionCard key={session.id} session={session} theme={theme} />
      ))}
    </View>
  );
}
