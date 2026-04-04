import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { ChatRoomWithDetails } from "../types";
import { formatChatRoomTime } from "../utils/helpers";

interface ChatRoomItemProps {
  room: ChatRoomWithDetails;
  onPress: () => void;
}

export function ChatRoomItem({ room, onPress }: ChatRoomItemProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  
  // Decide what to display for the room's avatar and name.
  // Real implementation might compute this based on participants list filtering out MOCK_CURRENT_USER_ID
  const displayParticipant = room.otherParticipant;
  const displayName = displayParticipant?.fullname || room.name || "Unknown Chat";
  const displayAvatar = displayParticipant?.avatarUrl;
  
  const formattedTime = formatChatRoomTime(room.lastMessageAt);
  const unreadCount = room.unreadCount ?? 0;

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3"
      onPress={onPress}
      activeOpacity={0.7}
      style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}
    >
      <View className="relative">
        {displayAvatar ? (
          <Image
            source={{ uri: displayAvatar }}
            className="w-14 h-14 rounded-full bg-gray-200"
          />
        ) : (
          <View
            className="w-14 h-14 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.muted }}
          >
            <Ionicons name="person" size={24} color={theme.mutedForeground} />
          </View>
        )}
        {/* Same badge pattern as FloatingChatButton (totalUnreadCount) — per-room unread */}
        {unreadCount > 0 && (
          <View
            className="absolute -top-1 -right-1 items-center justify-center"
            style={{
              backgroundColor: "red",
              minWidth: 22,
              height: 22,
              borderRadius: 11,
              paddingHorizontal: 4,
              borderWidth: 2,
              borderColor: theme.background,
            }}
          >
            <Text className="text-white text-xs font-bold" style={{ fontSize: 10 }}>
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-1 ml-4 justify-center">
        <View className="flex-row justify-between items-center mb-1">
          <Text
            className="text-base font-bold flex-1 mr-2"
            style={{ color: theme.foreground }}
            numberOfLines={1}
          >
            {displayName}
          </Text>
          {formattedTime && (
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              {formattedTime}
            </Text>
          )}
        </View>

        <Text
          className="text-sm"
          style={{ color: theme.mutedForeground }}
          numberOfLines={1}
        >
          {room.lastMessagePreview || "No messages yet"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
