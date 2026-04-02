import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/text";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

import { ChatMessageBubble } from "../components/ChatMessageBubble";
import { formatChatMessageTime, shouldShowTimestamp } from "../utils/helpers";
import { ChatMessage } from "../types";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useChatContext } from "../context/ChatProvider";
import { ChatRestService } from "../services/chatApiService";

/** Maps backend role strings to user-facing labels (Admin, Vendor, Tourist). */
function formatParticipantRole(role?: string): string {
  if (!role) return "";
  switch (role.toUpperCase()) {
    case "ADMIN":
      return "Admin";
    case "VENDOR":
      return "Vendor";
    case "TOURIST":
      return "Tourist";
    default:
      return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}

export default function ChatScreen({ route, navigation }: any) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const roomId = route.params?.roomId;
  const { user } = useAuth();
  const currentUserId = user?.id?.toString() || "";

  const { rooms, messagesByRoom, setMessagesByRoom, sendMessage: sendWsMessage } = useChatContext();

  const [messageText, setMessageText] = useState("");

  const room = rooms.find(r => r.id === roomId);
  const displayParticipant = room?.otherParticipant;
  const displayName = displayParticipant?.fullname || room?.name || "Chat";
  const displayAvatar = displayParticipant?.avatarUrl;

  const messages = messagesByRoom[roomId] || [];

  // Fetch History on Mount
  useEffect(() => {
    if (!roomId) return;

    const fetchHistory = async () => {
      try {
        const page = await ChatRestService.getRoomMessages(roomId, 0, 50);
        const historyMsgs = page.content;

        setMessagesByRoom((prev) => {
          const current = prev[roomId] || [];
          // Deduplicate by ID
          const msgMap = new Map<string, ChatMessage>();
          historyMsgs.forEach(m => msgMap.set(m.id, m));
          current.forEach(m => msgMap.set(m.id, m));

          // Sort inverted (newest first)
          const merged = Array.from(msgMap.values()).sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          return { ...prev, [roomId]: merged };
        });
      } catch (e) {
        console.error("Failed to load history", e);
      }
    };
    fetchHistory();
  }, [roomId]);

  const handleSend = () => {
    if (!messageText.trim() || !roomId) return;

    // STOMP transmit
    sendWsMessage(roomId, messageText.trim());
    setMessageText("");
  };

  const renderHeader = () => (
    <View
      className="px-2 py-3 flex-row items-center border-b"
      style={{ borderColor: theme.border, backgroundColor: theme.card }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
        <Ionicons name="arrow-back" size={24} color={theme.primary} />
      </TouchableOpacity>

      <View className="flex-1 flex-row items-center ml-2">
        {displayAvatar ? (
          <Image
            source={{ uri: displayAvatar }}
            className="w-10 h-10 rounded-full bg-gray-200"
          />
        ) : (
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.muted }}
          >
            <Ionicons name="person" size={20} color={theme.mutedForeground} />
          </View>
        )}
        <View className="ml-3 justify-center">
          <Text className="text-base font-bold" style={{ color: theme.foreground }}>
            {displayName}
          </Text>
          {displayParticipant && (
            <Text className="text-xs" style={{ color: theme.mutedForeground }}>
              {formatParticipantRole(displayParticipant.role)}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity className="p-2">
        <Ionicons name="ellipsis-horizontal" size={24} color={theme.foreground} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        {renderHeader()}

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          inverted
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16 }}
          renderItem={({ item, index }) => {
            const isMine = item.senderId === currentUserId;

            // In inverted list:
            // index + 1 is the chronologically PREVIOUS message (older)
            // index - 1 is the chronologically NEXT message (newer)
            const prevMsg = messages[index + 1];
            const nextMsg = messages[index - 1];

            // Show timestamp if gap with older message is > 30 mins
            let showTs = true;
            if (prevMsg) {
              showTs = shouldShowTimestamp(item.timestamp, prevMsg.timestamp);
            }

            // Show avatar next to this message if the chronologically newer message
            // is from a DIFFERENT sender OR if the time gap starts a new block (>30 mins)
            let showAvatar = true;
            if (nextMsg) {
              if (
                nextMsg.senderId === item.senderId &&
                !shouldShowTimestamp(nextMsg.timestamp, item.timestamp)
              ) {
                showAvatar = false;
              }
            }

            return (
              <ChatMessageBubble
                message={item}
                isMine={isMine}
                showAvatar={showAvatar}
                showTimestamp={showTs}
                timestampString={formatChatMessageTime(item.timestamp)}
                participantAvatar={displayAvatar}
              />
            );
          }}
        />

        {/* Input Bar */}
        <View
          className="px-4 py-3 flex-row items-end border-t"
          style={{ borderColor: theme.border, backgroundColor: theme.card }}
        >
          <View
            className="flex-1 min-h-[44px] max-h-[120px] rounded-2xl px-4 py-2.5 flex-row items-center border"
            style={{ backgroundColor: theme.background, borderColor: theme.border }}
          >
            <TextInput
              className="flex-1 text-base leading-5"
              style={{ color: theme.foreground, paddingTop: 0, paddingBottom: 0 }}
              placeholder="Message..."
              placeholderTextColor={theme.mutedForeground}
              multiline
              value={messageText}
              onChangeText={setMessageText}
            />
          </View>

          <TouchableOpacity
            className="ml-3 w-11 h-11 items-center justify-center rounded-full"
            style={{
              backgroundColor: messageText.trim() ? theme.primary : theme.muted,
            }}
            onPress={handleSend}
            disabled={!messageText.trim()}
          >
            <Ionicons
              name="send"
              size={18}
              color={messageText.trim() ? "#FFFFFF" : theme.mutedForeground}
              style={{ marginLeft: 2 }} // tweak send icon center
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
