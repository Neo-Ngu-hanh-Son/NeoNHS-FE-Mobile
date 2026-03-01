import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { WorkshopSessionResponse } from "../types";
import {
  formatPrice,
  formatShortDate,
  formatTime,
  getAvailabilityColor,
} from "../utils/helpers";

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  border: string;
  card: string;
  muted: string;
}

interface WorkshopSessionCardProps {
  session: WorkshopSessionResponse;
  theme: ThemeColors;
}

export default function WorkshopSessionCard({ session, theme }: WorkshopSessionCardProps) {
  const slotsColor = getAvailabilityColor(session.availableSlots, session.maxParticipants);
  const isFull = session.availableSlots <= 0;
  const fillPercent = Math.min(
    (session.currentEnrolled / session.maxParticipants) * 100,
    100
  );

  return (
    <View
      className="rounded-2xl border p-4"
      style={{
        borderColor: isFull ? "#ef444440" : theme.border,
        backgroundColor: theme.card,
        opacity: isFull ? 0.7 : 1,
      }}
    >
      {/* Date & time header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: theme.primary + "12" }}
          >
            <Ionicons name="calendar" size={22} color={theme.primary} />
          </View>
          <View>
            <Text className="text-sm font-bold" style={{ color: theme.foreground }}>
              {formatShortDate(session.startTime)}
            </Text>
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              {formatTime(session.startTime)} — {formatTime(session.endTime)}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold" style={{ color: theme.primary }}>
            {formatPrice(session.price)}
          </Text>
        </View>
      </View>

      {/* Availability bar */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={14} color={theme.mutedForeground} />
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              {session.currentEnrolled} / {session.maxParticipants} enrolled
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: slotsColor }}
            />
            <Text className="text-xs font-bold" style={{ color: slotsColor }}>
              {isFull ? "Full" : `${session.availableSlots} spots left`}
            </Text>
          </View>
        </View>
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.muted }}
        >
          <View
            className="h-full rounded-full"
            style={{
              backgroundColor: slotsColor,
              width: `${fillPercent}%`,
            }}
          />
        </View>
      </View>

      {/* Book button */}
      <TouchableOpacity
        className="py-3 rounded-xl items-center flex-row justify-center gap-2"
        style={{
          backgroundColor: isFull ? theme.muted : theme.primary,
        }}
        disabled={isFull}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isFull ? "close-circle-outline" : "bookmark-outline"}
          size={18}
          color={isFull ? theme.mutedForeground : "#fff"}
        />
        <Text
          className="font-bold text-sm"
          style={{ color: isFull ? theme.mutedForeground : "#fff" }}
        >
          {isFull ? "Fully Booked" : "Book This Session"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
