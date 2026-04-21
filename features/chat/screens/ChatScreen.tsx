import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Image } from 'expo-image';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';

import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { QuickReplies } from '../components/QuickReplies';
import { formatChatMessageTime, mergeServerChatHistory, shouldShowTimestamp } from '../utils/helpers';
import {
  hasTransferMarker,
  isTransferOfferMessage,
  stripTransferMarker,
} from '../utils/transferHuman';
import { ChatMessage, ProductSnippetParams } from '../types';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useChatContext } from '../context/ChatProvider';
import { ChatRestService } from '../services/chatApiService';
import { streamAiReply } from '../services/aiChatService';
import { SmartImage } from '@/components/ui/smart-image';

/** Maps backend role strings to user-facing labels. */
function formatParticipantRole(role?: string): string {
  if (!role) return '';
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return 'Admin';
    case 'VENDOR':
      return 'Vendor';
    case 'TOURIST':
      return 'Tourist';
    default:
      return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}

export default function ChatScreen({ route, navigation }: any) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const roomId = route.params?.roomId;
  const workshopSnippet: ProductSnippetParams | undefined = route.params?.workshopSnippet;

  const { user } = useAuth();
  const currentUserId = user?.id?.toString() || '';

  const {
    rooms,
    messagesByRoom,
    setMessagesByRoom,
    sendMessage: sendWsMessage,
    setActiveRoomId,
    sendTypingStart,
    sendTypingStop,
    subscribeToRoomTyping,
    sendReadReceipt,
    createOrOpenRoom,
    refetchRooms,
  } = useChatContext();

  const [messageText, setMessageText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiStreamingText, setAiStreamingText] = useState('');
  /** True after SSE `transfer` until WS shows an offer message or user acts (covers generic AI text without marker). */
  const [aiTransferOfferPending, setAiTransferOfferPending] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);
  const abortAiRef = useRef<(() => void) | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine if this is an AI-powered support room
  const room = rooms.find((r) => r.id === roomId);
  const isAiRoom = room?.roomType === 'AI_CHAT';

  const displayParticipant = room?.otherParticipant;
  const displayName = displayParticipant?.fullname || room?.name || 'Chat';
  const displayAvatar = displayParticipant?.avatarUrl;

  const messages = messagesByRoom[roomId] || [];

  // Room opened from transfer / deep link may be missing from context until list refetch
  useFocusEffect(
    useCallback(() => {
      if (!roomId) return;
      if (rooms.some((r) => r.id === roomId)) return;
      void refetchRooms();
    }, [roomId, rooms, refetchRooms])
  );

  // Drop SSE-only pending flag once the persisted AI handover message is in the list
  useEffect(() => {
    if (!isAiRoom || !messages[0]) return;
    const head = messages[0];
    if (head.senderId === 'AI_ASSISTANT' && isTransferOfferMessage(head, currentUserId)) {
      setAiTransferOfferPending(false);
    }
  }, [isAiRoom, messages, currentUserId]);

  const loadRoomHistory = useCallback(async () => {
    if (!roomId) return;
    try {
      const page = await ChatRestService.getRoomMessages(roomId, 0, 50);
      const historyMsgs = page.content;

      setMessagesByRoom((prev) => {
        const current = prev[roomId] || [];
        const merged = mergeServerChatHistory(historyMsgs, current);
        return { ...prev, [roomId]: merged };
      });

      if (historyMsgs.length > 0) {
        const newest = historyMsgs.reduce((a, b) =>
          new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime() ? a : b
        );
        if (newest.senderId !== currentUserId) {
          sendReadReceipt(roomId, newest.id);
        }
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, [roomId, currentUserId, setMessagesByRoom, sendReadReceipt]);

  // ── Fetch history + mark active ──────────────────────
  useEffect(() => {
    if (!roomId) return;
    setActiveRoomId(roomId);
    void loadRoomHistory();
    return () => setActiveRoomId(null);
  }, [roomId, loadRoomHistory, setActiveRoomId]);

  const handleRefreshMessages = useCallback(async () => {
    setRefreshingMessages(true);
    try {
      await loadRoomHistory();
    } finally {
      setRefreshingMessages(false);
    }
  }, [loadRoomHistory]);

  // ── Subscribe to room typing ─────────────────────────
  useEffect(() => {
    if (!roomId) return;
    const unsub = subscribeToRoomTyping(roomId, (data) => {
      if (data.senderId !== currentUserId) {
        setIsOtherTyping(data.isTyping);
      }
    });
    return unsub;
  }, [roomId, currentUserId, subscribeToRoomTyping]);

  // ── Send read receipt when new messages arrive ───────
  useEffect(() => {
    if (!messages.length || !roomId) return;
    const newest = messages[0]; // inverted list, index 0 = newest
    if (newest && newest.senderId !== currentUserId) {
      sendReadReceipt(roomId, newest.id);
    }
  }, [messages.length]);

  // ── Typing handler ───────────────────────────────────
  const handleTextChange = useCallback(
    (text: string) => {
      setMessageText(text);
      if (!roomId) return;

      sendTypingStart(roomId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop(roomId);
      }, 2500);
    },
    [roomId, sendTypingStart, sendTypingStop]
  );

  // ── Send text message ────────────────────────────────
  const handleSend = () => {
    if (!messageText.trim() || !roomId) return;
    sendTypingStop(roomId);

    if (isAiRoom) {
      handleSendToAi(messageText.trim());
    } else {
      sendWsMessage(roomId, messageText.trim());
    }
    setMessageText('');
  };

  // ── Send message to AI (SSE streaming) ────────────────
  const handleSendToAi = (text: string) => {
    if (!roomId || isAiThinking) return;

    setAiTransferOfferPending(false);
    setIsAiThinking(true);
    setAiStreamingText('');

    abortAiRef.current = streamAiReply(
      roomId,
      text,
      (chunk) => {
        if (chunk.type === 'message' && chunk.text) {
          setAiStreamingText((prev) => prev + chunk.text);
        } else if (chunk.type === 'transfer') {
          setAiStreamingText('');
          setAiTransferOfferPending(true);
        }
      },
      (_fullText) => {
        // AI response saved to MongoDB by backend, will arrive via WebSocket
        setIsAiThinking(false);
        setAiStreamingText('');
      },
      (error) => {
        setIsAiThinking(false);
        setAiStreamingText('');
        setAiTransferOfferPending(false);
        Alert.alert('AI Error', error || 'Could not get AI response. Please try again.');

        // Optionally remove the optimistic message on error if it failed to save
        // For now, keep it as it's probably saved but the reply failed
      }
    );
  };

  // Cleanup AI stream on unmount
  useEffect(() => {
    return () => {
      abortAiRef.current?.();
    };
  }, []);

  const handleRequestHuman = () => {
    if (!roomId) return;
    handleSendToAi('Tôi muốn gặp nhân viên hỗ trợ');
  };

  const handleTransferYes = async () => {
    if (!roomId) return;
    setAiTransferOfferPending(false);
    try {
      setIsAiThinking(true); // show loading state visually
      // Use context so the room (and admin otherParticipant) is in `rooms` before navigation
      const newRoom = await createOrOpenRoom("SYSTEM_SUPPORT", [], "Customer Support");

      let unansweredMessageStr = "Khách hàng muốn chuyển sang gặp Admin hỗ trợ.";
      const lastUserMsg = messages.find((m) => m.senderId === currentUserId);

      if (lastUserMsg) {
        unansweredMessageStr = `Chuyển từ trợ lý AI: ${lastUserMsg.content}`;
      } else if (messages[0]) {
        unansweredMessageStr = `Chuyển từ trợ lý AI: ${messages[0].content}`;
      }

      // Navigate to the new room
      navigation.replace("ChatRoom", { roomId: newRoom.id });

      // After a short delay, send the forwarded message to the new room
      setTimeout(() => {
        sendWsMessage(newRoom.id, unansweredMessageStr);
      }, 1000);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tạo yêu cầu hỗ trợ.");
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleTransferNo = () => {
    if (!roomId) return;
    setAiTransferOfferPending(false);
    handleSendToAi('Không, cảm ơn.');
  };

  // ── Send product snippet ─────────────────────────────
  const handleSendSnippet = () => {
    if (!roomId || !workshopSnippet) return;
    sendWsMessage(roomId, `I'd like to ask about this workshop.`, 'PRODUCT_SNIPPET', null, {
      workshopId: workshopSnippet.workshopId,
      title: workshopSnippet.title,
      price: workshopSnippet.price,
      thumbnailUrl: workshopSnippet.thumbnailUrl,
    });
    // Clear the snippet from nav params so the card disappears
    navigation.setParams({ workshopSnippet: undefined });
  };

  // ── Pick & send image ────────────────────────────────
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const localUri = result.assets[0].uri;
      const placeholderId = `__uploading_${Date.now()}`;

      // Create an optimistic placeholder message with a gray skeleton
      const placeholder: ChatMessage = {
        id: placeholderId,
        chatRoomId: roomId,
        senderId: currentUserId,
        content: '',
        timestamp: new Date().toISOString(),
        status: 'SENT',
        messageType: 'IMAGE',
        mediaUrl: null,
        _isUploading: true,
        _localUri: localUri,
      };

      // Insert placeholder into messages (inverted list, index 0 = newest)
      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: [placeholder, ...(prev[roomId] || [])],
      }));

      setIsUploading(true);
      const mediaUrl = await ChatRestService.uploadMedia(localUri);
      sendWsMessage(roomId, '', 'IMAGE', mediaUrl, null);

      // Remove the placeholder — the real message will arrive via WebSocket
      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || []).filter((m) => m.id !== placeholderId),
      }));
    } catch (e) {
      Alert.alert('Upload failed', 'Could not upload image. Please try again.');
      console.error('Image upload error', e);
      // Remove any lingering placeholders on error
      setMessagesByRoom((prev) => ({
        ...prev,
        [roomId]: (prev[roomId] || []).filter((m) => !m._isUploading),
      }));
    } finally {
      setIsUploading(false);
    }
  };

  // ── Send location ────────────────────────────────────
  const handleSendLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cấp quyền', 'Ứng dụng cần quyền truy cập vị trí để gửi vị trí của bạn.');
        return;
      }

      setIsUploading(true);
      const location = await Location.getCurrentPositionAsync({});

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      let addressStr = '';
      if (geocode) {
        addressStr = [geocode.streetNumber, geocode.street, geocode.subregion, geocode.region]
          .filter(Boolean)
          .join(', ');
      }

      sendWsMessage(roomId, '', 'LOCATION', null, {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        address: addressStr || 'My Location'
      });
    } catch (e: any) {
      console.log('Location error:', e);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại.');
    } finally {
      setIsUploading(false);
    }
  };

  // ── Header ───────────────────────────────────────────
  const renderHeader = () => (
    <View
      className="flex-row items-center border-b px-2 py-3"
      style={{ borderColor: theme.border, backgroundColor: theme.card }}>
      <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
        <Ionicons name="arrow-back" size={24} color={theme.primary} />
      </TouchableOpacity>

      <View className="ml-2 flex-1 flex-row items-center">
        {isAiRoom ? (
          <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: '#6366f1' }}>
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          </View>
        ) : displayAvatar ? (
          <Image source={{ uri: displayAvatar }} className="h-10 w-10 rounded-full bg-gray-200" />
        ) : (
          <View className="h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: theme.muted }}>
            <Ionicons name="person" size={20} color={theme.mutedForeground} />
          </View>
        )}
        <View className="ml-3 justify-center">
          <Text className="text-base font-bold" style={{ color: theme.foreground }}>
            {isAiRoom ? 'Trợ lý NeoNHS' : displayName}
          </Text>
          {isAiThinking ? (
            <Text className="text-xs" style={{ color: theme.primary }}>
              Đang trả lời...
            </Text>
          ) : isOtherTyping ? (
            <Text className="text-xs" style={{ color: theme.primary }}>
              typing...
            </Text>
          ) : isAiRoom ? (
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              Trợ lý ảo AI
            </Text>
          ) : displayParticipant ? (
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              {formatParticipantRole(displayParticipant.role)}
            </Text>
          ) : null}
        </View>
      </View>

      {isAiRoom && (
        <TouchableOpacity
          className="mr-1 rounded-lg px-3 py-2"
          style={{ backgroundColor: theme.muted }}
          onPress={handleRequestHuman}>
          <Text className="text-xs font-semibold" style={{ color: theme.primary }}>
            Gặp NV hỗ trợ
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity className="p-2">
        <Ionicons name="ellipsis-horizontal" size={24} color={theme.foreground} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}>
        {renderHeader()}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshingMessages}
              onRefresh={handleRefreshMessages}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
          ListHeaderComponent={
            isOtherTyping ? (
              <TypingIndicator />
            ) : isAiThinking ? (
              <View className="px-4 py-2">
                {aiStreamingText ? (
                  <>
                    <View className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3" style={{ backgroundColor: theme.muted }}>
                      <Text className="text-sm" style={{ color: theme.foreground }}>
                        {stripTransferMarker(aiStreamingText)}
                      </Text>
                    </View>
                    {isAiRoom && hasTransferMarker(aiStreamingText) && (
                      <View className="mt-2 flex-row items-center">
                        <TouchableOpacity
                          onPress={handleTransferYes}
                          className="mr-2 rounded-full px-4 py-2"
                          style={{ backgroundColor: theme.primary }}>
                          <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Sẵn lòng</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleTransferNo}
                          className="rounded-full border px-4 py-2"
                          style={{ borderColor: theme.border, backgroundColor: theme.muted }}>
                          <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>Không cần</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                ) : (
                  <TypingIndicator />
                )}
              </View>
            ) : isAiRoom &&
              aiTransferOfferPending &&
              messages[0] &&
              messages[0].senderId === currentUserId ? (
              <View className="px-4 py-2">
                <View className="mt-1 flex-row items-center">
                  <TouchableOpacity
                    onPress={handleTransferYes}
                    className="mr-2 rounded-full px-4 py-2"
                    style={{ backgroundColor: theme.primary }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Sẵn lòng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleTransferNo}
                    className="rounded-full border px-4 py-2"
                    style={{ borderColor: theme.border, backgroundColor: theme.muted }}>
                    <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>Không cần</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const isMine = item.senderId === currentUserId && item.senderId !== 'AI_ASSISTANT';
            const prevMsg = messages[index + 1];
            const nextMsg = messages[index - 1];

            let showTs = true;
            if (prevMsg) showTs = shouldShowTimestamp(item.timestamp, prevMsg.timestamp);

            let showAvatar = true;
            if (nextMsg) {
              if (nextMsg.senderId === item.senderId && !shouldShowTimestamp(nextMsg.timestamp, item.timestamp)) {
                showAvatar = false;
              }
            }

            const showHumanTransferRow =
              isAiRoom &&
              index === 0 &&
              !isMine &&
              (isTransferOfferMessage(item, currentUserId) ||
                (aiTransferOfferPending && item.senderId === 'AI_ASSISTANT'));

            return (
              <View>
                <ChatMessageBubble
                  message={item}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  showTimestamp={showTs}
                  timestampString={formatChatMessageTime(item.timestamp)}
                  participantAvatar={displayAvatar}
                  onProductSnippetPress={(id, type) => {
                    if (type === 'event') {
                      navigation.navigate('EventDetail', { eventId: id });
                    } else {
                      navigation.navigate('WorkshopDetail', { workshopId: id });
                    }
                  }}
                  onGoToCart={() => {
                    // @ts-ignore
                    navigation.navigate('Tabs', { screen: 'TestCart' });
                  }}
                />
                {showHumanTransferRow && (
                  <View className="ml-[44px] mt-1 mb-2 flex-row items-center">
                    <TouchableOpacity
                      onPress={handleTransferYes}
                      className="mr-2 rounded-full px-4 py-2"
                      style={{ backgroundColor: theme.primary }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Sẵn lòng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleTransferNo}
                      className="rounded-full border px-4 py-2"
                      style={{ borderColor: theme.border, backgroundColor: theme.muted }}>
                      <Text style={{ color: theme.foreground, fontWeight: 'bold' }}>Không cần</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />

        {/* Quick Replies for AI */}
        {isAiRoom && (
          <QuickReplies
            replies={['Ở Ngũ Hành Sơn có gì chơi?', 'Có những workshop gì?', 'Giá vé tham quan thế nào ?', 'Cho tôi thông tin về các sự kiện sắp tới', 'Hướng dẫn đường đi đến Ngũ Hành Sơn']}
            onSelect={(reply) => handleSendToAi(reply)}
          />
        )}

        {/* Product Snippet Card (if entering from Workshop) */}
        {workshopSnippet && (
          <View
            className="mx-4 mb-2 flex-row items-center overflow-hidden rounded-xl border"
            style={{ borderColor: theme.border, backgroundColor: theme.card }}>
            {workshopSnippet.thumbnailUrl && (
              <SmartImage
                uri={workshopSnippet.thumbnailUrl}
                className="h-14 w-14 rounded-lg"
                alt={workshopSnippet.title}
              />
            )}
            <View className="flex-1 px-3 py-2">
              <Text className="text-sm font-bold" style={{ color: theme.foreground }} numberOfLines={1}>
                {workshopSnippet.title}
              </Text>
              <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                {workshopSnippet.price.toLocaleString('vi-VN')} ₫
              </Text>
            </View>
            <TouchableOpacity
              className="mr-2 rounded-lg px-3 py-2"
              style={{ backgroundColor: theme.primary }}
              onPress={handleSendSnippet}>
              <Text className="text-xs font-bold text-white">Send</Text>
            </TouchableOpacity>
            <TouchableOpacity className="pr-3" onPress={() => navigation.setParams({ workshopSnippet: undefined })}>
              <Ionicons name="close" size={18} color={theme.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View
          className="flex-row items-end border-t px-4 py-3"
          style={{ borderColor: theme.border, backgroundColor: theme.card }}>

          {/* Action Menu (+) */}
          <TouchableOpacity
            className="mr-2 h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: theme.muted }}
            onPress={() => {
              Alert.alert(
                'Tùy chọn gửi',
                'Chọn loại nội dung bạn muốn gửi',
                [
                  { text: 'Chụp ảnh / Thư viện', onPress: handlePickImage },
                  { text: 'Gửi Vị trí hiện tại', onPress: handleSendLocation },
                  { text: 'Hủy', style: 'cancel' }
                ]
              );
            }}
            disabled={isUploading}>
            <Ionicons name={isUploading ? 'hourglass' : 'add'} size={24} color={theme.mutedForeground} />
          </TouchableOpacity>

          <View
            className="max-h-[120px] min-h-[44px] flex-1 flex-row items-center rounded-2xl border px-4 py-2.5"
            style={{ backgroundColor: theme.background, borderColor: theme.border }}>
            <TextInput
              className="flex-1 text-base leading-5"
              style={{ color: theme.foreground, paddingTop: 0, paddingBottom: 0 }}
              placeholder="Message..."
              placeholderTextColor={theme.mutedForeground}
              multiline
              value={messageText}
              onChangeText={handleTextChange}
            />
          </View>

          <TouchableOpacity
            className="ml-3 h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: messageText.trim() && !isAiThinking ? theme.primary : theme.muted }}
            onPress={handleSend}
            disabled={!messageText.trim() || isAiThinking}>
            {isAiThinking ? (
              <ActivityIndicator size="small" color={theme.mutedForeground} />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={messageText.trim() ? '#FFFFFF' : theme.mutedForeground}
                style={{ marginLeft: 2 }}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
