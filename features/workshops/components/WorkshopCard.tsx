import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { WorkshopTemplateResponse } from '../types';
import { formatPrice, formatDuration } from '../utils/helpers';
import { SmartImage } from '@/components/ui/smart-image';

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
      className="mb-4 overflow-hidden rounded-2xl border"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Image */}
      <View className="relative h-48">
        {thumbnail ? (
          <SmartImage uri={thumbnail.imageUrl} className="h-full w-full" contentFit="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center" style={{ backgroundColor: theme.muted }}>
            <Ionicons name="image-outline" size={48} color={theme.mutedForeground} />
          </View>
        )}

        {/* Rating badge */}
        <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-xl bg-white/90 px-2.5 py-1 shadow-sm dark:bg-slate-900/90">
          <Ionicons name="star" size={13} color="#eab308" />
          <Text className="text-xs font-bold" style={{ color: theme.foreground }}>
            {workshop.averageRating.toFixed(1)}
          </Text>
          <Text className="text-[10px]" style={{ color: theme.mutedForeground }}>
            ({workshop.totalRatings})
          </Text>
        </View>

        {/* Duration badge */}
        <View className="absolute bottom-3 left-3 flex-row items-center gap-1 rounded-lg bg-black/60 px-2.5 py-1">
          <Ionicons name="time-outline" size={12} color="#fff" />
          <Text className="text-[11px] font-semibold text-white">{formatDuration(workshop.estimatedDuration)}</Text>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {/* Tags */}
        {workshop.tags.length > 0 && (
          <View className="mb-2 flex-row flex-wrap gap-1.5">
            {workshop.tags.map((tag) => (
              <View
                key={tag.id}
                className="flex-row items-center gap-1 rounded-md px-2 py-0.5"
                style={{ backgroundColor: tag.tagColor + '15' }}>
                {tag.iconUrl && <SmartImage uri={tag.iconUrl} className="h-3 w-3 rounded-full" />}
                <Text className="text-[10px] font-bold" style={{ color: tag.tagColor }}>
                  {tag.name}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Name */}
        <Text className="text-lg font-bold leading-tight" style={{ color: theme.foreground }} numberOfLines={2}>
          {workshop.name}
        </Text>

        {/* Short description */}
        <Text className="mt-1 text-sm leading-relaxed" style={{ color: theme.mutedForeground }} numberOfLines={2}>
          {workshop.shortDescription}
        </Text>

        {/* Bottom row: vendor + price */}
        <View className="mt-3 flex-row items-center justify-between">
          <View className="mr-3 flex-1 flex-row items-center gap-1.5">
            <View
              className="h-6 w-6 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.primary + '15' }}>
              <Ionicons name="storefront-outline" size={12} color={theme.primary} />
            </View>
            <Text className="text-xs font-medium" style={{ color: theme.mutedForeground }} numberOfLines={1}>
              {workshop.vendorName}
            </Text>
          </View>
          <Text className="text-base font-bold" style={{ color: theme.primary }}>
            {formatPrice(workshop.defaultPrice)}
          </Text>
        </View>

        {/* Participants range */}
        <View className="mt-2 flex-row items-center gap-1.5">
          <Ionicons name="people-outline" size={14} color={theme.mutedForeground} />
          <Text className="text-xs" style={{ color: theme.mutedForeground }}>
            {workshop.minParticipants}–{workshop.maxParticipants} participants
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
