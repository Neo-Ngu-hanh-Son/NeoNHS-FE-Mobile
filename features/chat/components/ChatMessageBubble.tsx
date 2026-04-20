import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import Markdown from 'react-native-markdown-display';
import { ChatMessage } from '../types';
import { hasTransferMarker, stripTransferMarker } from '../utils/transferHuman';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  timestampString: string;
  participantAvatar?: string | null;
  onProductSnippetPress?: (id: string, type?: 'workshop' | 'event') => void;
  onGoToCart?: () => void;
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
  onGoToCart,
}: ChatMessageBubbleProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const msgType = message.messageType ?? 'TEXT';

  const markdownStyle = {
    body: {
      color: isMine ? '#FFFFFF' : theme.foreground,
      fontSize: 15,
      lineHeight: 20,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 0,
    },
    link: {
      color: isMine ? '#E5E7EB' : theme.primary,
      textDecorationLine: 'underline',
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    code_inline: {
      backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
      borderRadius: 4,
      paddingHorizontal: 4,
    },
    image: {
      borderRadius: 12,
      width: SCREEN_WIDTH * 0.65,
      height: 150,
      marginTop: 8,
      marginBottom: 8,
      backgroundColor: isDarkColorScheme ? '#374151' : '#F3F4F6',
    },
  } as any;

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
              <View className="mt-1.5 px-2">
                <Markdown
                  style={markdownStyle}
                  onLinkPress={(url) => {
                    if (url.startsWith('neo-nhs://')) {
                      const parts = url.replace('neo-nhs://', '').split('/');
                      const type = parts[0] === 'event' ? 'event' : 'workshop';
                      const id = parts[1];
                      if (id) onProductSnippetPress?.(id, type);
                      return false;
                    }
                    Linking.openURL(url).catch(() => { });
                    return true;
                  }}
                  rules={{
                    image: (node: any) => {
                      const { src, alt } = node.attributes;
                      const parts = alt ? alt.split('|') : [];
                      const title = parts[0]?.trim();
                      const idPart = parts.find((p: string) => p.trim().toUpperCase().startsWith('ID:'));
                      const typePart = parts.find((p: string) => p.trim().toUpperCase().startsWith('TYPE:'));

                      const id = idPart ? idPart.split(':')[1]?.trim() : null;
                      const type = typePart ? typePart.split(':')[1]?.trim().toLowerCase() : 'workshop';

                      if (id) {
                        return (
                          <TouchableOpacity
                            key={node.key}
                            activeOpacity={0.8}
                            onPress={() => onProductSnippetPress?.(id, type as any)}
                            className="flex-row items-center p-2 my-2 rounded-xl border"
                            style={{
                              width: '100%',
                              backgroundColor: isDarkColorScheme ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                              borderColor: theme.border,
                            }}>
                            <Image
                              source={{ uri: src }}
                              className="rounded-lg"
                              contentFit="cover"
                              style={{ width: 60, height: 60 }}
                            />
                            <View className="flex-1 ml-3">
                              <Text
                                className="text-xs font-bold"
                                style={{ color: theme.foreground }}
                                numberOfLines={2}>
                                {title}
                              </Text>
                              <Text className="text-[10px] font-bold mt-1" style={{ color: theme.primary }}>
                                Nhấn để xem chi tiết →
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      }

                      return (
                        <Image
                          key={node.key}
                          source={{ uri: src }}
                          style={markdownStyle.image}
                          contentFit="cover"
                        />
                      );
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </View>
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
          <View className="p-1">
            {/* Clickable Card Snippet */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const id = meta?.workshopId || meta?.eventId;
                const type = meta?.workshopId ? 'workshop' : 'event';
                if (id) onProductSnippetPress?.(id, type as any);
              }}
              className="flex-row items-center p-2 rounded-xl border"
              style={{
                width: '100%',
                backgroundColor: isDarkColorScheme ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                borderColor: theme.border,
              }}>
              {meta?.thumbnailUrl && (
                <Image
                  source={{ uri: meta.thumbnailUrl }}
                  className="rounded-lg"
                  contentFit="cover"
                  style={{ width: 60, height: 60 }}
                />
              )}
              <View className="flex-1 ml-3">
                <Text
                  className="text-xs font-bold"
                  style={{ color: isMine ? '#FFFFFF' : theme.foreground }}
                  numberOfLines={2}>
                  {meta?.title ?? 'Workshop'}
                </Text>
                {meta?.price != null && (
                  <Text className="mt-1 text-[11px] font-semibold" style={{ color: theme.primary }}>
                    {typeof meta.price === 'number' ? meta.price.toLocaleString('vi-VN') : meta.price} ₫
                  </Text>
                )}
                <View className="mt-1">
                  <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>
                    Nhấn để xem chi tiết →
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* AI Explanation Text */}
            {message.content ? (
              <View className="mt-3 px-2 pb-1">
                <Markdown
                  style={{ ...markdownStyle, body: { ...markdownStyle.body, fontSize: 14, lineHeight: 20 } }}
                  onLinkPress={(url) => {
                    if (url.startsWith('neo-nhs://')) {
                      const parts = url.replace('neo-nhs://', '').split('/');
                      const type = parts[0] === 'event' ? 'event' : 'workshop';
                      const id = parts[1];
                      if (id) onProductSnippetPress?.(id, type);
                      return false;
                    }
                    Linking.openURL(url).catch(() => { });
                    return true;
                  }}
                  rules={{
                    image: (node: any) => {
                      const { src, alt } = node.attributes;
                      const parts = alt ? alt.split('|') : [];
                      const title = parts[0]?.trim();
                      const idPart = parts.find((p: string) => p.trim().toUpperCase().startsWith('ID:'));
                      const typePart = parts.find((p: string) => p.trim().toUpperCase().startsWith('TYPE:'));

                      const id = idPart ? idPart.split(':')[1]?.trim() : null;
                      const type = typePart ? typePart.split(':')[1]?.trim().toLowerCase() : 'workshop';

                      if (id) {
                        return (
                          <TouchableOpacity
                            key={node.key}
                            activeOpacity={0.8}
                            onPress={() => onProductSnippetPress?.(id, type as any)}
                            className="flex-row items-center p-2 my-2 rounded-xl border"
                            style={{
                              width: '100%',
                              backgroundColor: isDarkColorScheme ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                              borderColor: theme.border,
                            }}>
                            <Image
                              source={{ uri: src }}
                              className="rounded-lg"
                              contentFit="cover"
                              style={{ width: 60, height: 60 }}
                            />
                            <View className="flex-1 ml-3">
                              <Text
                                className="text-xs font-bold"
                                style={{ color: theme.foreground }}
                                numberOfLines={2}>
                                {title}
                              </Text>
                              <Text className="text-[10px] font-bold mt-1" style={{ color: theme.primary }}>
                                Nhấn để xem chi tiết →
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      }
                      return null;
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              </View>
            ) : null}
          </View>
        );
      }

      case 'LOCATION': {
        const meta = message.metadata;
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center p-2 min-w-[200px]"
            onPress={() => {
              // TODO: Navigate or open Map view
              // e.g. navigation.navigate('MapScreen', { lat: meta?.lat, lng: meta?.lng })
            }}>
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 mr-3">
              <Ionicons name="location" size={26} color={isMine ? '#FFFFFF' : theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold" style={{ color: isMine ? '#FFFFFF' : theme.foreground }}>
                Vị trí đã chia sẻ
              </Text>
              {meta?.address ? (
                <Text className="text-xs mt-0.5" style={{ color: isMine ? '#E5E7EB' : theme.mutedForeground }} numberOfLines={2}>
                  {meta.address}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      }

      default: // TEXT
        return (
          <View>
            <Markdown
              style={markdownStyle}
              onLinkPress={(url) => {
                if (url.startsWith('neo-nhs://')) {
                  const parts = url.replace('neo-nhs://', '').split('/');
                  const type = parts[0] === 'event' ? 'event' : 'workshop';
                  const id = parts[1];
                  if (id) onProductSnippetPress?.(id, type);
                  return false;
                }
                Linking.openURL(url).catch(() => { });
                return true;
              }}
              rules={{
                image: (node: any) => {
                  const { src, alt } = node.attributes;
                  const parts = alt ? alt.split('|') : [];
                  const title = parts[0]?.trim();
                  const idPart = parts.find((p: string) => p.trim().toUpperCase().startsWith('ID:'));
                  const typePart = parts.find((p: string) => p.trim().toUpperCase().startsWith('TYPE:'));

                  const id = idPart ? idPart.split(':')[1]?.trim() : null;
                  const type = typePart ? typePart.split(':')[1]?.trim().toLowerCase() : 'workshop';

                  if (id) {
                    return (
                      <TouchableOpacity
                        key={node.key}
                        activeOpacity={0.8}
                        onPress={() => onProductSnippetPress?.(id, type as any)}
                        className="flex-row items-center p-2 my-2 rounded-xl border"
                        style={{
                          width: '100%',
                          backgroundColor: isDarkColorScheme ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                          borderColor: theme.border,
                        }}>
                        <Image
                          source={{ uri: src }}
                          className="rounded-lg"
                          contentFit="cover"
                          style={{ width: 60, height: 60 }}
                        />
                        <View className="flex-1 ml-3">
                          <Text
                            className="text-xs font-bold"
                            style={{ color: theme.foreground }}
                            numberOfLines={2}>
                            {title}
                          </Text>
                          <Text className="text-[10px] font-bold mt-1" style={{ color: theme.primary }}>
                            Nhấn để xem chi tiết →
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <Image
                      key={node.key}
                      source={{ uri: src }}
                      style={markdownStyle.image}
                      contentFit="cover"
                    />
                  );
                },
              }}
            >
              {message.content}
            </Markdown>
            {message.metadata?.redirectToCart && (
              <TouchableOpacity
                onPress={onGoToCart}
                className="mt-3 p-3 rounded-xl flex-row items-center justify-center shadow-sm"
                style={{ backgroundColor: theme.primary }}>
                <Ionicons name="cart" size={18} color="#FFF" />
                <Text className="ml-2 text-white font-bold text-sm">Tới Giỏ hàng Ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        );
    }
  };

  const msgContent = message.content?.trim();
  const hasMedia = message.mediaUrl || message.metadata || message.messageType === 'IMAGE' || message.messageType === 'LOCATION' || message.messageType === 'PRODUCT_SNIPPET' || message._isUploading;

  if (!msgContent && !hasMedia) {
    return null;
  }

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
              message.senderId === 'AI_ASSISTANT' ? (
                <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#6366f1' }}>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                </View>
              ) : participantAvatar ? (
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
          className={`max-w-[75%] rounded-2xl ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'} ${msgType === 'IMAGE' || msgType === 'PRODUCT_SNIPPET' ? 'overflow-hidden p-1' : 'px-4 py-2.5'
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
