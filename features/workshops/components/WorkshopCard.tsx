import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { WorkshopTemplateResponse } from "../types";
import { formatPrice, formatDuration } from "../utils/helpers";
import { SmartImage } from "@/components/ui/smart-image";

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  border: string;
  card: string;
  muted: string;
}

interface WorkshopCardProps {
  workshop: WorkshopTemplateResponse;
  theme: ThemeColors;
  onPress: () => void;
}

export default function WorkshopCard({ workshop, theme, onPress }: WorkshopCardProps) {
  const thumbnail = workshop.images.find((img) => img.isThumbnail) || workshop.images[0];

  return (
    <TouchableOpacity
      className="rounded-2xl overflow-hidden border mb-4"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View className="h-48 relative">
        {thumbnail ? (
          <SmartImage
            uri={thumbnail.imageUrl}
            className="w-full h-full"
            style={{ resizeMode: "cover" }}
          />
        ) : (
          <View
            className="w-full h-full items-center justify-center"
            style={{ backgroundColor: theme.muted }}
          >
            <Ionicons name="image-outline" size={48} color={theme.mutedForeground} />
          </View>
        )}

        {/* Rating badge */}
        <View className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 px-2.5 py-1 rounded-xl flex-row items-center gap-1 shadow-sm">
          <Ionicons name="star" size={13} color="#eab308" />
          <Text className="text-xs font-bold" style={{ color: theme.foreground }}>
            {workshop.averageRating.toFixed(1)}
          </Text>
          <Text className="text-[10px]" style={{ color: theme.mutedForeground }}>
            ({workshop.totalRatings})
          </Text>
        </View>

        {/* Duration badge */}
        <View className="absolute bottom-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg flex-row items-center gap-1">
          <Ionicons name="time-outline" size={12} color="#fff" />
          <Text className="text-white text-[11px] font-semibold">
            {formatDuration(workshop.estimatedDuration)}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Tags */}
        {workshop.tags.length > 0 && (
          <View className="flex-row flex-wrap gap-1.5 mb-2">
            {workshop.tags.map((tag) => (
              <View
                key={tag.id}
                className="flex-row items-center gap-1 px-2 py-0.5 rounded-md"
                style={{ backgroundColor: tag.tagColor + "15" }}
              >
                {tag.iconUrl && (
                  <SmartImage uri={tag.iconUrl} className="w-3 h-3 rounded-full" />
                )}
                <Text className="text-[10px] font-bold" style={{ color: tag.tagColor }}>
                  {tag.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Name */}
        <Text
          className="text-lg font-bold leading-tight"
          style={{ color: theme.foreground }}
          numberOfLines={2}
        >
          {workshop.name}
        </Text>

        {/* Short description */}
        <Text
          className="text-sm mt-1 leading-relaxed"
          style={{ color: theme.mutedForeground }}
          numberOfLines={2}
        >
          {workshop.shortDescription}
        </Text>

        {/* Bottom row: vendor + price */}
        <View className="flex-row items-center justify-between mt-3">
          <View className="flex-row items-center gap-1.5 flex-1 mr-3">
            <View
              className="w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.primary + "15" }}
            >
              <Ionicons name="storefront-outline" size={12} color={theme.primary} />
            </View>
            <Text
              className="text-xs font-medium"
              style={{ color: theme.mutedForeground }}
              numberOfLines={1}
            >
              {workshop.vendorName}
            </Text>
          </View>
          <Text className="text-base font-bold" style={{ color: theme.primary }}>
            {formatPrice(workshop.defaultPrice)}
          </Text>
        </View>

        {/* Participants range */}
        <View className="flex-row items-center gap-1.5 mt-2">
          <Ionicons name="people-outline" size={14} color={theme.mutedForeground} />
          <Text className="text-xs" style={{ color: theme.mutedForeground }}>
            {workshop.minParticipants}–{workshop.maxParticipants} participants
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
