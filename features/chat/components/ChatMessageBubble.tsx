import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { ChatMessage } from '../types';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  timestampString: string;
  participantAvatar?: string | null;
  onProductSnippetPress?: (workshopId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Status ticks ───────────────────────────────────────
function StatusTicks({ status }: { status: ChatMessage['status'] }) {
  if (status === 'READ') {
    return (
      <View className="ml-1.5 flex-row">
        <Ionicons name="checkmark-done" size={14} color="#22C55E" />
      </View>
    );
  }
  if (status === 'DELIVERED') {
    return (
      <View className="ml-1.5 flex-row">
        <Ionicons name="checkmark-done" size={14} color="#9CA3AF" />
      </View>
    );
  }
  // SENT
  return (
    <View className="ml-1.5 flex-row">
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

  const msgType = message.messageType ?? 'TEXT';

  // ── Render bubble content by type ────────────────────
  const renderContent = () => {
    switch (msgType) {
      case 'IMAGE':
        if (message._isUploading) {
          // ── Uploading placeholder: gray frame with blurred local preview ──
          return (
            <View
              className="items-center justify-center overflow-hidden rounded-xl"
              style={{
                width: SCREEN_WIDTH * 0.55,
                height: SCREEN_WIDTH * 0.55,
                backgroundColor: isDarkColorScheme ? '#374151' : '#E5E7EB',
              }}>
              {message._localUri ? (
                <Image
                  source={{ uri: message._localUri }}
                  className="rounded-xl"
                  contentFit="cover"
                  style={{
                    width: SCREEN_WIDTH * 0.55,
                    height: SCREEN_WIDTH * 0.55,
                    opacity: 0.4,
                  }}
                />
              ) : null}
              <View
                className="absolute items-center justify-center"
                style={{
                  width: SCREEN_WIDTH * 0.55,
                  height: SCREEN_WIDTH * 0.55,
                }}>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-black/30">
                  <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
                </View>
                <Text className="mt-2 text-xs font-medium" style={{ color: '#FFFFFF' }}>
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
                contentFit="cover"
                style={{ width: SCREEN_WIDTH * 0.55, height: SCREEN_WIDTH * 0.55 }}
              />
            </TouchableOpacity>
            {message.content ? (
              <Text className="mt-1.5 text-[15px] leading-5" style={{ color: isMine ? '#FFFFFF' : theme.foreground }}>
                {message.content}
              </Text>
            ) : null}

            {/* Full-screen image modal */}
            <Modal visible={imageModalVisible} transparent animationType="fade">
              <View className="flex-1 items-center justify-center bg-black/90">
                <TouchableOpacity
                  className="absolute right-5 top-14 z-10 p-2"
                  onPress={() => setImageModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Image
                  source={{ uri: message.mediaUrl ?? undefined }}
                  contentFit="contain"
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                />
              </View>
            </Modal>
          </>
        );

      case 'PRODUCT_SNIPPET': {
        const meta = message.metadata;
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => meta?.workshopId && onProductSnippetPress?.(meta.workshopId)}
            style={{ width: SCREEN_WIDTH * 0.6 }}>
            {meta?.thumbnailUrl && (
              <Image
                source={{ uri: meta.thumbnailUrl }}
                className="rounded-t-xl"
                contentFit="cover"
                style={{ width: '100%', height: 120 }}
              />
            )}
            <View className="p-3">
              <Text
                className="text-sm font-bold"
                style={{ color: isMine ? '#FFFFFF' : theme.foreground }}
                numberOfLines={2}>
                {meta?.title ?? 'Workshop'}
              </Text>
              {meta?.price != null && (
                <Text className="mt-1 text-xs" style={{ color: isMine ? '#E5E7EB' : theme.mutedForeground }}>
                  {meta.price.toLocaleString('vi-VN')} ₫
                </Text>
              )}
              {message.content ? (
                <Text className="mt-1.5 text-xs" style={{ color: isMine ? '#D1D5DB' : theme.mutedForeground }}>
                  {message.content}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      }

      default: // TEXT
        return (
          <Text className="text-[15px] leading-5" style={{ color: isMine ? '#FFFFFF' : theme.foreground }}>
            {message.content}
          </Text>
        );
    }
  };

  return (
    <View className="mb-1">
      {/* Timestamp gap */}
      {showTimestamp && (
        <View className="my-4 items-center">
          <Text className="text-xs font-medium" style={{ color: theme.mutedForeground }}>
            {timestampString}
          </Text>
        </View>
      )}

      {/* Message Row */}
      <View className={`flex-row items-end px-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {/* Other user avatar */}
        {!isMine && (
          <View className="mr-2">
            {showAvatar ? (
              participantAvatar ? (
                <Image source={{ uri: participantAvatar }} className="h-8 w-8 rounded-full bg-gray-200" />
              ) : (
                <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <Ionicons name="person" size={16} color={theme.mutedForeground} />
                </View>
              )
            ) : (
              <View className="h-8 w-8" />
            )}
          </View>
        )}

        {/* Bubble */}
        <View
          className={`max-w-[75%] rounded-2xl ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'} ${
            msgType === 'IMAGE' || msgType === 'PRODUCT_SNIPPET' ? 'overflow-hidden p-1' : 'px-4 py-2.5'
          }`}
          style={{ backgroundColor: isMine ? theme.primary : theme.muted }}>
          {renderContent()}

          {/* Status ticks (only for own messages) */}
          {isMine && <View className="mr-1 mt-0.5 flex-row items-center justify-end"></View>}
        </View>
      </View>
    </View>
  );
}
