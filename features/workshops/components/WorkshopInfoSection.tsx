import React from "react";
import { View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { WorkshopTemplateResponse } from "../types";
import { formatPrice, formatDuration } from "../utils/helpers";
import { SmartImage } from "@/components/ui/smart-image";

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  muted: string;
}

interface WorkshopInfoSectionProps {
  workshop: WorkshopTemplateResponse;
  theme: ThemeColors;
}

export default function WorkshopInfoSection({ workshop, theme }: WorkshopInfoSectionProps) {
  return (
    <View>
      {/* Title & Rating */}
      <View className="px-5 pt-4">
        <View className="flex-row items-center gap-2 mb-2">
          <View className="flex-row items-center gap-1 bg-amber-500/15 px-2.5 py-1 rounded-lg">
            <Ionicons name="star" size={14} color="#eab308" />
            <Text className="text-sm font-bold" style={{ color: "#eab308" }}>
              {workshop.averageRating.toFixed(1)}
            </Text>
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              ({workshop.totalRatings} reviews)
            </Text>
          </View>
        </View>
        <Text
          className="text-2xl font-bold leading-tight"
          style={{ color: theme.foreground }}
        >
          {workshop.name}
        </Text>
        {workshop.shortDescription && (
          <Text
            className="text-sm mt-2 leading-relaxed"
            style={{ color: theme.mutedForeground }}
          >
            {workshop.shortDescription}
          </Text>
        )}
      </View>

      {/* Info chips */}
      <View className="px-5 mt-4 gap-3">
        {/* Duration */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: theme.primary + "15" }}
          >
            <Ionicons name="time-outline" size={20} color={theme.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
              {formatDuration(workshop.estimatedDuration)}
            </Text>
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              Estimated duration
            </Text>
          </View>
        </View>

        {/* Price */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: "#f59e0b15" }}
          >
            <Ionicons name="pricetag-outline" size={20} color="#f59e0b" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold" style={{ color: theme.primary }}>
              {formatPrice(workshop.defaultPrice)}
            </Text>
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              Starting from
            </Text>
          </View>
        </View>

        {/* Participants */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: "#8b5cf615" }}
          >
            <Ionicons name="people-outline" size={20} color="#8b5cf6" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
              {workshop.minParticipants}–{workshop.maxParticipants} participants
            </Text>
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              Group size
            </Text>
          </View>
        </View>

        {/* Vendor */}
        <View className="flex-row items-center gap-3">
          <View
            className="w-10 h-10 rounded-xl items-center justify-center"
            style={{ backgroundColor: "#3b82f615" }}
          >
            <Ionicons name="storefront-outline" size={20} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
              {workshop.vendorName}
            </Text>
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              Hosted by
            </Text>
          </View>
        </View>
      </View>

      {/* Tags */}
      {workshop.tags && workshop.tags.length > 0 && (
        <View className="px-5 mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {workshop.tags.map((tag) => (
              <View
                key={tag.id}
                className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: tag.tagColor + "18" }}
              >
                {tag.iconUrl && (
                  <SmartImage uri={tag.iconUrl} className="w-4 h-4 rounded-full" />
                )}
                <Text className="text-xs font-semibold" style={{ color: tag.tagColor }}>
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
