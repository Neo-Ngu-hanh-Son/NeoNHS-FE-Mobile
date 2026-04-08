import React, { useState } from "react";
import { View, Image, TouchableOpacity, Modal, Dimensions } from "react-native";
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
  onProductSnippetPress?: (workshopId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Status ticks ───────────────────────────────────────
function StatusTicks({ status }: { status: ChatMessage["status"] }) {
  if (status === "READ") {
    return (
      <View className="flex-row ml-1.5">
        <Ionicons name="checkmark-done" size={14} color="#22C55E" />
      </View>
    );
  }
  if (status === "DELIVERED") {
    return (
      <View className="flex-row ml-1.5">
        <Ionicons name="checkmark-done" size={14} color="#9CA3AF" />
      </View>
    );
  }
  // SENT
  return (
    <View className="flex-row ml-1.5">
      <Ionicons name="checkmark" size={14} color="#9CA3AF" />
    </View>
  );
}

// ── Main component ─────────────────────────────────────
export function ChatMessageBubble({
  message,
  isMine,
  showAvatar,
  showTimestamp,
  timestampString,
  participantAvatar,
  onProductSnippetPress,
}: ChatMessageBubbleProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const msgType = message.messageType ?? "TEXT";

  // ── Render bubble content by type ────────────────────
  const renderContent = () => {
    switch (msgType) {
      case "IMAGE":
        if (message._isUploading) {
          // ── Uploading placeholder: gray frame with blurred local preview ──
          return (
            <View
              className="rounded-xl overflow-hidden items-center justify-center"
              style={{
                width: SCREEN_WIDTH * 0.55,
                height: SCREEN_WIDTH * 0.55,
                backgroundColor: isDarkColorScheme ? "#374151" : "#E5E7EB",
              }}
            >
              {message._localUri ? (
                <Image
                  source={{ uri: message._localUri }}
                  className="rounded-xl"
                  style={{
                    width: SCREEN_WIDTH * 0.55,
                    height: SCREEN_WIDTH * 0.55,
                    resizeMode: "cover",
                    opacity: 0.4,
                  }}
                />
              ) : null}
              <View
                className="absolute items-center justify-center"
                style={{
                  width: SCREEN_WIDTH * 0.55,
                  height: SCREEN_WIDTH * 0.55,
                }}
              >
                <View className="w-10 h-10 rounded-full items-center justify-center bg-black/30">
                  <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
                </View>
                <Text className="text-xs mt-2 font-medium" style={{ color: "#FFFFFF" }}>
                  Uploading...
                </Text>
              </View>
            </View>
          );
        }
        return (
          <>
            <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.85}>
              <Image
                source={{ uri: message.mediaUrl ?? undefined }}
                className="rounded-xl"
                style={{ width: SCREEN_WIDTH * 0.55, height: SCREEN_WIDTH * 0.55, resizeMode: "cover" }}
              />
            </TouchableOpacity>
            {message.content ? (
              <Text className="text-[15px] leading-5 mt-1.5" style={{ color: isMine ? "#FFFFFF" : theme.foreground }}>
                {message.content}
              </Text>
            ) : null}

            {/* Full-screen image modal */}
            <Modal visible={imageModalVisible} transparent animationType="fade">
              <View className="flex-1 bg-black/90 items-center justify-center">
                <TouchableOpacity
                  className="absolute top-14 right-5 z-10 p-2"
                  onPress={() => setImageModalVisible(false)}
                >
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Image
                  source={{ uri: message.mediaUrl ?? undefined }}
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH, resizeMode: "contain" }}
                />
              </View>
            </Modal>
          </>
        );

      case "PRODUCT_SNIPPET": {
        const meta = message.metadata;
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => meta?.workshopId && onProductSnippetPress?.(meta.workshopId)}
            style={{ width: SCREEN_WIDTH * 0.6 }}
          >
            {meta?.thumbnailUrl && (
              <Image
                source={{ uri: meta.thumbnailUrl }}
                className="rounded-t-xl"
                style={{ width: "100%", height: 120, resizeMode: "cover" }}
              />
            )}
            <View className="p-3">
              <Text className="text-sm font-bold" style={{ color: isMine ? "#FFFFFF" : theme.foreground }} numberOfLines={2}>
                {meta?.title ?? "Workshop"}
              </Text>
              {meta?.price != null && (
                <Text className="text-xs mt-1" style={{ color: isMine ? "#E5E7EB" : theme.mutedForeground }}>
                  {meta.price.toLocaleString("vi-VN")} ₫
                </Text>
              )}
              {message.content ? (
                <Text className="text-xs mt-1.5" style={{ color: isMine ? "#D1D5DB" : theme.mutedForeground }}>
                  {message.content}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      }

      default: // TEXT
        return (
          <Text className="text-[15px] leading-5" style={{ color: isMine ? "#FFFFFF" : theme.foreground }}>
            {message.content}
          </Text>
        );
    }
  };

  return (
    <View className="mb-1">
      {/* Timestamp gap */}
      {showTimestamp && (
        <View className="items-center my-4">
          <Text className="text-xs font-medium" style={{ color: theme.mutedForeground }}>
            {timestampString}
          </Text>
        </View>
      )}

      {/* Message Row */}
      <View className={`flex-row px-4 items-end ${isMine ? "justify-end" : "justify-start"}`}>
        {/* Other user avatar */}
        {!isMine && (
          <View className="mr-2">
            {showAvatar ? (
              participantAvatar ? (
                <Image source={{ uri: participantAvatar }} className="w-8 h-8 rounded-full bg-gray-200" />
              ) : (
                <View className="w-8 h-8 rounded-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <Ionicons name="person" size={16} color={theme.mutedForeground} />
                </View>
              )
            ) : (
              <View className="w-8 h-8" />
            )}
          </View>
        )}

        {/* Bubble */}
        <View
          className={`rounded-2xl max-w-[75%] ${isMine ? "rounded-br-sm" : "rounded-bl-sm"} ${msgType === "IMAGE" || msgType === "PRODUCT_SNIPPET" ? "p-1 overflow-hidden" : "px-4 py-2.5"
            }`}
          style={{ backgroundColor: isMine ? theme.primary : theme.muted }}
        >
          {renderContent()}

          {/* Status ticks (only for own messages) */}
          {isMine && (
            <View className="flex-row justify-end items-center mt-0.5 mr-1">
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
