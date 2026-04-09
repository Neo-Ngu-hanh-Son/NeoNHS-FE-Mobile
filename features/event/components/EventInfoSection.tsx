import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/text';
import { EventResponse } from '../types';
import { getStatusColor, formatDateTime, formatPrice } from '../utils/helpers';
import { SmartImage } from '@/components/ui/smart-image';

interface ThemeColors {
  foreground: string;
  mutedForeground: string;
  primary: string;
  muted: string;
}

interface EventInfoSectionProps {
  event: EventResponse;
  theme: ThemeColors;
  onOpenTimelineMap?: () => void;
}

export default function EventInfoSection({ event, theme, onOpenTimelineMap }: EventInfoSectionProps) {
  return (
    <View>
      {/* Title & Status */}
      <View className="px-5 pt-4">
        <View className="mb-2 flex-row items-center gap-2">
          <View className="rounded-lg px-2.5 py-1" style={{ backgroundColor: getStatusColor(event.status) }}>
            <Text className="text-xs font-bold uppercase text-white">{event.status}</Text>
          </View>
          {event.isTicketRequired && (
            <View className="rounded-lg bg-amber-500/20 px-2.5 py-1">
              <Text className="text-xs font-bold text-amber-600">Ticket Required</Text>
            </View>
          )}
        </View>
        <Text className="text-2xl font-bold leading-tight" style={{ color: theme.foreground }}>
          {event.name}
        </Text>
        {event.shortDescription && (
          <Text className="mt-2 text-sm leading-relaxed" style={{ color: theme.mutedForeground }}>
            {event.shortDescription}
          </Text>
        )}
      </View>

      {/* Info Chips */}
      <View className="mt-4 gap-3 px-5">
        {/* Date & Time */}
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: theme.primary + '15' }}>
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
            <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#ef444415' }}>
              <Ionicons name="location-outline" size={20} color="#ef4444" />
            </View>
            <Text className="flex-1 text-sm font-semibold" style={{ color: theme.foreground }}>
              {event.locationName}
            </Text>
          </View>
        )}

        {/* Participants */}
        {event.maxParticipants != null && (
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#8b5cf615' }}>
              <Ionicons name="people-outline" size={20} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-semibold" style={{ color: theme.foreground }}>
                {event.currentEnrolled || 0} / {event.maxParticipants} attendees
              </Text>
              <View className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: theme.muted }}>
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: '#8b5cf6',
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
            <View className="h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: '#f59e0b15' }}>
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
        <View className="mt-4 px-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {event.tags.map((tag) => (
              <View
                key={tag.id}
                className="flex-row items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ backgroundColor: tag.tagColor + '18' }}>
                {tag.iconUrl && <SmartImage uri={tag.iconUrl} className="h-4 w-4 rounded-full" />}
                <Text className="text-xs font-semibold" style={{ color: tag.tagColor }}>
                  {tag.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {onOpenTimelineMap && (
        <View className="mt-4 px-5">
          <TouchableOpacity
            onPress={onOpenTimelineMap}
            className="flex-row items-center justify-center gap-2 rounded-xl px-4 py-3"
            style={{ backgroundColor: theme.primary }}>
            <Ionicons name="map-outline" size={18} color="#ffffff" />
            <Text className="text-sm font-bold text-white">Open Timeline Map</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
