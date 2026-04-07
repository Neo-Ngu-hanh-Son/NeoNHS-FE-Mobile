import React, { useRef } from "react";
import { View, TouchableOpacity, Image, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { ChatRoomWithDetails } from "../types";
import { formatChatRoomTime } from "../utils/helpers";

interface ChatRoomItemProps {
  room: ChatRoomWithDetails;
  onPress: () => void;
  onHide?: () => void;
}

export function ChatRoomItem({ room, onPress, onHide }: ChatRoomItemProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const swipeableRef = useRef<Swipeable>(null);

  const displayParticipant = room.otherParticipant;
  const displayName = displayParticipant?.fullname || room.name || "Unknown Chat";
  const displayAvatar = displayParticipant?.avatarUrl;
  const formattedTime = formatChatRoomTime(room.lastMessageAt);
  const unreadCount = room.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;

  // ── Swipe right action (reveals "Hide") ──────────────
  const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.5], extrapolate: "clamp" });

    return (
      <TouchableOpacity
        className="items-center justify-center px-5"
        style={{ backgroundColor: "#EF4444" }}
        onPress={() => {
          swipeableRef.current?.close();
          onHide?.();
        }}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale }] }} className="items-center">
          <Ionicons name="eye-off-outline" size={22} color="#FFFFFF" />
          <Text className="text-white text-xs mt-1 font-medium">Hide</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity
        className="flex-row items-center px-4 py-3"
        onPress={onPress}
        activeOpacity={0.7}
        style={{ borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.background }}
      >
        {/* Avatar + badge */}
        <View className="relative">
          {displayAvatar ? (
            <Image source={{ uri: displayAvatar }} className="w-14 h-14 rounded-full bg-gray-200" />
          ) : (
            <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: theme.muted }}>
              <Ionicons name="person" size={24} color={theme.mutedForeground} />
            </View>
          )}
          {hasUnread && (
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

        {/* Text content */}
        <View className="flex-1 ml-4 justify-center">
          <View className="flex-row justify-between items-center mb-1">
            <Text
              className={`text-base flex-1 mr-2 ${hasUnread ? "font-extrabold" : "font-bold"}`}
              style={{ color: theme.foreground }}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            {formattedTime && (
              <Text className="text-xs" style={{ color: hasUnread ? theme.primary : theme.mutedForeground }}>
                {formattedTime}
              </Text>
            )}
          </View>
          <Text
            className={`text-sm ${hasUnread ? "font-semibold" : ""}`}
            style={{ color: hasUnread ? theme.foreground : theme.mutedForeground }}
            numberOfLines={1}
          >
            {room.lastMessagePreview
              ? room.lastMessagePreview
              : room.lastMessageAt
                ? "📷 Image"
                : "No messages yet"}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}
