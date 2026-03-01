import React from "react";
import { View, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { EventResponse } from "../types";
import { getStatusColor, formatDateTime, formatPrice } from "../utils/helpers";

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  muted: string;
}

interface EventInfoSectionProps {
  event: EventResponse;
  theme: ThemeColors;
}

export default function EventInfoSection({ event, theme }: EventInfoSectionProps) {
  return (
    <View>
      {/* Title & Status */}
      <View className="px-5 pt-4">
        <View className="flex-row items-center gap-2 mb-2">
          <View
            className="px-2.5 py-1 rounded-lg"
            style={{ backgroundColor: getStatusColor(event.status) }}
          >
            <Text className="text-white text-xs font-bold uppercase">
              {event.status}
            </Text>
          </View>
          {event.isTicketRequired && (
            <View className="px-2.5 py-1 rounded-lg bg-amber-500/20">
              <Text className="text-amber-600 text-xs font-bold">
                Ticket Required
              </Text>
            </View>
          )}
        </View>
        <Text
          className="text-2xl font-bold leading-tight"
          style={{ color: theme.foreground }}
        >
          {event.name}
        </Text>
        {event.shortDescription && (
          <Text
            className="text-sm mt-2 leading-relaxed"
            style={{ color: theme.mutedForeground }}
          >
            {event.shortDescription}
          </Text>
        )}
      </View>

      {/* Info Chips */}
      <View className="px-5 mt-4 gap-3">
        {/* Date & Time */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: theme.primary + "15" }}
          >
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
              {formatDateTime(event.startTime)}
            </Text>
            {event.endTime && (
              <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                to {formatDateTime(event.endTime)}
              </Text>
            )}
          </View>
        </View>

        {/* Location */}
        {event.locationName && (
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: "#ef444415" }}
            >
              <Ionicons name="location-outline" size={20} color="#ef4444" />
            </View>
            <Text className="text-sm font-semibold flex-1" style={{ color: theme.foreground }}>
              {event.locationName}
            </Text>
          </View>
        )}

        {/* Participants */}
        {event.maxParticipants != null && (
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: "#8b5cf615" }}
            >
              <Ionicons name="people-outline" size={20} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                {event.currentEnrolled || 0} / {event.maxParticipants} attendees
              </Text>
              <View className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: theme.muted }}>
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: "#8b5cf6",
                    width: `${Math.min(((event.currentEnrolled || 0) / event.maxParticipants) * 100, 100)}%`,
                  }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Price */}
        {event.price != null && (
          <View className="flex-row items-center gap-3">
            <View
              className="w-10 h-10 rounded-xl items-center justify-center"
              style={{ backgroundColor: "#f59e0b15" }}
            >
              <Ionicons name="pricetag-outline" size={20} color="#f59e0b" />
            </View>
            <Text className="text-sm font-bold" style={{ color: theme.primary }}>
              {formatPrice(event.price)}
            </Text>
          </View>
        )}
      </View>

      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <View className="px-5 mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {event.tags.map((tag) => (
              <View
                key={tag.id}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: tag.tagColor + "18" }}
              >
                {tag.iconUrl && (
                  <Image
                    source={{ uri: tag.iconUrl }}
                    className="w-4 h-4 rounded-full"
                  />
                )}
                <Text
                  className="text-xs font-semibold"
                  style={{ color: tag.tagColor }}
                >
                  {tag.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
