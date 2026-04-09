import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from "react";
import { ChatMessage, ChatRoomWithDetails, ReadReceiptEvent, RoomType, MessageType } from "../types";
import { ChatRestService, ChatWebSocketService } from "../services/chatApiService";
import { useAuth } from "@/features/auth/context/AuthContext";

// ════════════════════════════════════════════════════════
// Context value shape
// ════════════════════════════════════════════════════════
interface ChatContextValue {
  // Room state
  rooms: ChatRoomWithDetails[];
  setRooms: React.Dispatch<React.SetStateAction<ChatRoomWithDetails[]>>;
  isLoadingRooms: boolean;
  isConnected: boolean;

  // Messages
  messagesByRoom: Record<string, ChatMessage[]>;
  setMessagesByRoom: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  sendMessage: (roomId: string, content: string, messageType?: MessageType, mediaUrl?: string | null, metadata?: Record<string, any> | null) => void;

  // Unread
  totalUnreadCount: number;
  supportUnreadCount: number;
  setActiveRoomId: (id: string | null) => void;
  resetUnreadCount: (roomId: string) => void;

  // Room management
  hideRoom: (roomId: string) => Promise<void>;
  createOrOpenRoom: (roomType: RoomType, participantIds?: string[], name?: string | null) => Promise<ChatRoomWithDetails>;

  // Typing
  sendTypingStart: (roomId: string) => void;
  sendTypingStop: (roomId: string) => void;
  subscribeToRoomTyping: (roomId: string, cb: (data: { isTyping: boolean; senderId: string }) => void) => () => void;

  // Read receipts
  sendReadReceipt: (roomId: string, lastReadMessageId: string) => void;

  // WebSocket ref access for bottom sheet usage
  wsServiceRef: React.MutableRefObject<ChatWebSocketService | null>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

// ════════════════════════════════════════════════════════
// Provider
// ════════════════════════════════════════════════════════
export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken } = useAuth();
  const currentUserId = user?.id?.toString() || "";

  const [rooms, setRooms] = useState<ChatRoomWithDetails[]>([]);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  const wsServiceRef = useRef<ChatWebSocketService | null>(null);
  const activeRoomIdRef = useRef<string | null>(null);

  // ── Derived unread counts ────────────────────────────
  const totalUnreadCount = useMemo(
    () => rooms.filter(r => !r.isHidden).reduce((acc, r) => acc + (r.unreadCount || 0), 0),
    [rooms]
  );

  const supportUnreadCount = useMemo(
    () => rooms.filter(r => r.roomType === "SYSTEM_SUPPORT" && !r.isHidden).reduce((acc, r) => acc + (r.unreadCount || 0), 0),
    [rooms]
  );

  // ── Active room tracking ─────────────────────────────
  const setActiveRoomId = useCallback((id: string | null) => {
    activeRoomIdRef.current = id;
    if (id) resetUnreadCount(id);
  }, []);

  const resetUnreadCount = useCallback((roomId: string) => {
    setRooms(prev => prev.map(r => (r.id === roomId ? { ...r, unreadCount: 0 } : r)));
  }, []);

  // ── Room management ──────────────────────────────────
  const hideRoom = useCallback(async (roomId: string) => {
    try {
      await ChatRestService.toggleRoomVisibility(roomId, true);
      setRooms(prev => prev.map(r => (r.id === roomId ? { ...r, isHidden: true } : r)));
    } catch (e) {
      console.error("Failed to hide room", e);
    }
  }, []);

  const createOrOpenRoom = useCallback(
    async (roomType: RoomType, participantIds: string[] = [], name: string | null = null): Promise<ChatRoomWithDetails> => {
      const room = await ChatRestService.createRoom(roomType, participantIds, name);

      // Enrich participant
      const otherParticipantId = room.participants.find((p: string) => p !== currentUserId);
      let otherParticipant = null;
      if (otherParticipantId) {
        try {
          otherParticipant = await ChatRestService.getChatParticipantInfo(otherParticipantId);
        } catch {
          otherParticipant = { id: otherParticipantId, fullname: "Unknown User", avatarUrl: null, role: "UNKNOWN" };
        }
      }

      const enriched: ChatRoomWithDetails = { ...room, otherParticipant, unreadCount: 0 };

      // Add to state if not already present
      setRooms(prev => {
        const exists = prev.some(r => r.id === enriched.id);
        if (exists) return prev.map(r => (r.id === enriched.id ? { ...r, isHidden: false } : r));
        return [enriched, ...prev];
      });

      return enriched;
    },
    [currentUserId]
  );

  // ── Initial load + WS connection ─────────────────────
  useEffect(() => {
    if (!accessToken || !currentUserId) return;

    const loadRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const serverRooms = await ChatRestService.getMyRooms();

        const enrichedRooms = await Promise.all(
          serverRooms.map(async (room) => {
            const otherParticipantId = room.participants.find((p: string) => p !== currentUserId);
            let otherParticipant = null;
            if (otherParticipantId) {
              try {
                otherParticipant = await ChatRestService.getChatParticipantInfo(otherParticipantId);
              } catch {
                otherParticipant = { id: otherParticipantId, fullname: "Unknown User", avatarUrl: null, role: "UNKNOWN" };
              }
            }
            return { ...room, otherParticipant, unreadCount: room.unreadCount ?? 0 } as ChatRoomWithDetails;
          })
        );

        setRooms(enrichedRooms);
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
      } finally {
        setIsLoadingRooms(false);
      }
    };
    loadRooms();

    // WebSocket
    const ws = new ChatWebSocketService(accessToken);
    wsServiceRef.current = ws;

    const handlePayload = (payload: ChatMessage | ReadReceiptEvent) => {
      // ── READ_RECEIPT ──
      if ("type" in payload && payload.type === "READ_RECEIPT") {
        const receipt = payload as ReadReceiptEvent;
        // Only process receipts from OTHER users (i.e., "they read my messages")
        if (receipt.readerId === currentUserId) return;

        setMessagesByRoom(prev => {
          const roomMsgs = prev[receipt.chatRoomId];
          if (!roomMsgs) return prev;

          const updated = roomMsgs.map(m => {
            // Mark messages up to lastReadMessageId as READ
            if (m.senderId === currentUserId && m.status !== "READ" && m.id <= receipt.lastReadMessageId) {
              return { ...m, status: "READ" as const };
            }
            return m;
          });

          return { ...prev, [receipt.chatRoomId]: updated };
        });
        return;
      }

      // ── Normal ChatMessage ──
      const message = payload as ChatMessage;

      setMessagesByRoom(prev => {
        const roomMsgs = prev[message.chatRoomId] || [];
        if (roomMsgs.some(m => m.id === message.id)) return prev;
        return { ...prev, [message.chatRoomId]: [message, ...roomMsgs] };
      });

      setRooms(prevRooms => {
        let updatedRooms = prevRooms.map(room => {
          if (room.id === message.chatRoomId) {
            const isRead = activeRoomIdRef.current === room.id || message.senderId === currentUserId;
            return {
              ...room,
              lastMessagePreview: message.messageType === "IMAGE" ? "📷 Image" : message.content,
              lastMessageAt: message.timestamp,
              lastMessageSenderId: message.senderId,
              unreadCount: isRead ? room.unreadCount : (room.unreadCount || 0) + 1,
              isHidden: false, // resurface hidden rooms on new message
            };
          }
          return room;
        });

        updatedRooms.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || 0).getTime();
          return timeB - timeA;
        });
        return updatedRooms;
      });
    };

    ws.connect(handlePayload, () => setIsConnected(true), (err) => console.error("WS Error", err));

    return () => {
      ws.disconnect();
      wsServiceRef.current = null;
    };
  }, [accessToken, currentUserId]);

  // ── Message send wrapper ─────────────────────────────
  const sendMessage = useCallback(
    (roomId: string, content: string, messageType: MessageType = "TEXT", mediaUrl?: string | null, metadata?: Record<string, any> | null) => {
      wsServiceRef.current?.sendMessage(roomId, content, messageType, mediaUrl, metadata);
    },
    []
  );

  // ── Typing wrappers ──────────────────────────────────
  const sendTypingStart = useCallback((roomId: string) => wsServiceRef.current?.sendTypingStart(roomId), []);
  const sendTypingStop = useCallback((roomId: string) => wsServiceRef.current?.sendTypingStop(roomId), []);
  const subscribeToRoomTyping = useCallback(
    (roomId: string, cb: (data: { isTyping: boolean; senderId: string }) => void) =>
      wsServiceRef.current?.subscribeToRoomTyping(roomId, cb) ?? (() => { }),
    []
  );

  // ── Read receipt wrapper ─────────────────────────────
  const sendReadReceipt = useCallback(
    (roomId: string, lastReadMessageId: string) => wsServiceRef.current?.sendReadReceipt(roomId, lastReadMessageId),
    []
  );

  return (
    <ChatContext.Provider
      value={{
        rooms,
        setRooms,
        isLoadingRooms,
        isConnected,
        messagesByRoom,
        setMessagesByRoom,
        sendMessage,
        totalUnreadCount,
        supportUnreadCount,
        setActiveRoomId,
        resetUnreadCount,
        hideRoom,
        createOrOpenRoom,
        sendTypingStart,
        sendTypingStop,
        subscribeToRoomTyping,
        sendReadReceipt,
        wsServiceRef,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
};
