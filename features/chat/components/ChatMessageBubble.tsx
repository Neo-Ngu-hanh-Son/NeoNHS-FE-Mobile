import React from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";
import { ChatMessage } from "../types";

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  timestampString: string;
  participantAvatar?: string | null;
}

export function ChatMessageBubble({
  message,
  isMine,
  showAvatar,
  showTimestamp,
  timestampString,
  participantAvatar,
}: ChatMessageBubbleProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <View className="mb-1">
      {/* 30-min Timestamp gap */}
      {showTimestamp && (
        <View className="items-center my-4">
          <Text className="text-xs font-medium" style={{ color: theme.mutedForeground }}>
            {timestampString}
          </Text>
        </View>
      )}

      {/* Message Row */}
      <View
        className={`flex-row px-4 items-end ${
          isMine ? "justify-end" : "justify-start"
        }`}
      >
        {/* Other user avatar placeholder/image aligned bottom */}
        {!isMine && (
          <View className="mr-2">
            {showAvatar ? (
              participantAvatar ? (
                <Image
                  source={{ uri: participantAvatar }}
                  className="w-8 h-8 rounded-full bg-gray-200"
                />
              ) : (
                <View
                  className="w-8 h-8 rounded-full items-center justify-center bg-gray-200 dark:bg-gray-700"
                >
                  <Ionicons name="person" size={16} color={theme.mutedForeground} />
                </View>
              )
            ) : (
              // Empty space to align consecutive messages properly
              <View className="w-8 h-8" />
            )}
          </View>
        )}

        {/* Bubble */}
        <View
          className={`px-4 py-2.5 rounded-2xl max-w-[75%] ${
            isMine ? "rounded-br-sm" : "rounded-bl-sm"
          }`}
          style={{
            backgroundColor: isMine ? theme.primary : theme.muted,
          }}
        >
          <Text
            className="text-[15px] leading-5"
            style={{ color: isMine ? "#FFFFFF" : theme.foreground }}
          >
            {message.content}
          </Text>
        </View>
      </View>
    </View>
  );
}
