import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { ChatRoomWithDetails } from '../types';
import { formatChatRoomTime } from '../utils/helpers';

interface ChatRoomItemProps {
  room: ChatRoomWithDetails;
  onPress: () => void;
  onHide?: () => void;
  onMarkAsRead?: () => void;
}

export function ChatRoomItem({ room, onPress, onHide, onMarkAsRead }: ChatRoomItemProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const swipeableRef = useRef<Swipeable>(null);

  const isAiRoom = room.roomType === 'AI_CHAT';
  const displayParticipant = room.otherParticipant;
  const displayName = isAiRoom ? 'Trợ lý NeoNHS' : (displayParticipant?.fullname || room.name || 'Unknown Chat');
  const displayAvatar = displayParticipant?.avatarUrl;
  const formattedTime = formatChatRoomTime(room.lastMessageAt);
  const unreadCount = room.unreadCount ?? 0;
  const hasUnread = unreadCount > 0;

  // ── Swipe right action (reveals "Hide") ──────────────
  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.5], extrapolate: 'clamp' });

    return (
      <TouchableOpacity
        className="items-center justify-center px-5"
        style={{ backgroundColor: '#EF4444' }}
        onPress={() => {
          swipeableRef.current?.close();
          onHide?.();
        }}
        activeOpacity={0.7}>
        <Animated.View style={{ transform: [{ scale }] }} className="items-center">
          <Ionicons name="eye-off-outline" size={22} color="#FFFFFF" />
          <Text className="mt-1 text-xs font-medium text-white">Hide</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  // ── Swipe left action (reveals "Read") ───────────────
  const renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.5, 1], extrapolate: 'clamp' });

    return (
      <TouchableOpacity
        className="items-center justify-center px-5"
        style={{ backgroundColor: '#3B82F6' }}
        onPress={() => {
          swipeableRef.current?.close();
          if (onMarkAsRead) onMarkAsRead();
        }}
        activeOpacity={0.7}>
        <Animated.View style={{ transform: [{ scale }] }} className="items-center">
          <Ionicons name="checkmark-done-outline" size={22} color="#FFFFFF" />
          <Text className="mt-1 text-xs font-medium text-white">Read</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} renderLeftActions={renderLeftActions} overshootRight={false} overshootLeft={false}>
      <TouchableOpacity
        className="flex-row items-center px-4 py-3"
        onPress={onPress}
        activeOpacity={0.7}
        style={{ borderBottomWidth: 1, borderBottomColor: theme.border, backgroundColor: theme.background }}>
        {/* Avatar + badge */}
        <View className="relative">
          {isAiRoom ? (
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#6366f1' }}>
              <Ionicons name="sparkles" size={28} color="#FFFFFF" />
            </View>
          ) : displayAvatar ? (
            <Image source={{ uri: displayAvatar }} className="h-14 w-14 rounded-full bg-gray-200" />
          ) : (
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.muted }}>
              <Ionicons name="person" size={24} color={theme.mutedForeground} />
            </View>
          )}
          {hasUnread && (
            <View
              className="absolute -right-1 -top-1 items-center justify-center"
              style={{
                backgroundColor: 'red',
                minWidth: 22,
                height: 22,
                borderRadius: 11,
                paddingHorizontal: 4,
                borderWidth: 2,
                borderColor: theme.background,
              }}>
              <Text className="text-xs font-bold text-white" style={{ fontSize: 10 }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Text content */}
        <View className="ml-4 flex-1 justify-center">
          <View className="mb-1 flex-row items-center justify-between">
            <Text
              className={`mr-2 flex-1 text-base ${hasUnread ? 'font-extrabold' : 'font-bold'}`}
              style={{ color: theme.foreground }}
              numberOfLines={1}>
              {displayName}
            </Text>
            {formattedTime && (
              <Text className="text-xs" style={{ color: hasUnread ? theme.primary : theme.mutedForeground }}>
                {formattedTime}
              </Text>
            )}
          </View>
          <Text
            className={`text-sm ${hasUnread ? 'font-semibold' : ''}`}
            style={{ color: hasUnread ? theme.foreground : theme.mutedForeground }}
            numberOfLines={1}>
            {room.lastMessagePreview ? room.lastMessagePreview : room.lastMessageAt ? '📷 Image' : 'No messages yet'}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}
