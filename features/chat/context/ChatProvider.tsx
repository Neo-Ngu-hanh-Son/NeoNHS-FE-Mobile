import React, { createContext, useContext, useEffect, useState, useRef, useMemo } from "react";
import { ChatMessage, ChatRoomWithDetails } from "../types";
import { ChatRestService, ChatWebSocketService } from "../services/chatApiService";
import { useAuth } from "@/features/auth/context/AuthContext";

// Simple mock enrichment fallback removed

interface ChatContextValue {
  rooms: ChatRoomWithDetails[];
  setRooms: React.Dispatch<React.SetStateAction<ChatRoomWithDetails[]>>;
  isLoadingRooms: boolean;
  isConnected: boolean;
  sendMessage: (roomId: string, content: string) => void;
  messagesByRoom: Record<string, ChatMessage[]>;
  setMessagesByRoom: React.Dispatch<React.SetStateAction<Record<string, ChatMessage[]>>>;
  totalUnreadCount: number;
  setActiveRoomId: (id: string | null) => void;
  resetUnreadCount: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, accessToken } = useAuth();
  
  const currentUserId = user?.id?.toString() || "";
  
  const [rooms, setRooms] = useState<ChatRoomWithDetails[]>([]);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  
  const wsServiceRef = useRef<ChatWebSocketService | null>(null);
  const activeRoomIdRef = useRef<string | null>(null);

  const totalUnreadCount = useMemo(() => {
    return rooms.reduce((acc, room) => acc + (room.unreadCount || 0), 0);
  }, [rooms]);

  const setActiveRoomId = (id: string | null) => {
    activeRoomIdRef.current = id;
    if (id) {
      resetUnreadCount(id);
    }
  };

  const resetUnreadCount = (roomId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, unreadCount: 0 } : r));
  };

  // 1. Initial Load & WS Connection
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
              } catch (e) {
                console.error(`Failed to fetch info for user ${otherParticipantId}`, e);
                // Fallback
                otherParticipant = {
                  id: otherParticipantId,
                  fullname: `Unknown User`,
                  avatarUrl: null,
                  role: "UNKNOWN"
                };
              }
            }
            
            return {
              ...room,
              otherParticipant,
              unreadCount: room.unreadCount ?? 0,
            };
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

    // Start WS
    const ws = new ChatWebSocketService(accessToken);
    wsServiceRef.current = ws;

    const handleIncomingMessage = (message: ChatMessage) => {
      // Append to global messages store for the specific room
      setMessagesByRoom(prev => {
        const roomMsgs = prev[message.chatRoomId] || [];
        const exists = roomMsgs.some(m => m.id === message.id);
        if (exists) return prev;
        
        // Push the new message to FRONT because it's for an inverted flatlist (newest first)
        return {
          ...prev,
          [message.chatRoomId]: [message, ...roomMsgs]
        };
      });

      // Update the room preview
      setRooms(prevRooms => {
        let updatedRooms = prevRooms.map(room => {
          if (room.id === message.chatRoomId) {
            const isRead = activeRoomIdRef.current === room.id || message.senderId === currentUserId;
            return {
              ...room,
              lastMessagePreview: message.content,
              lastMessageAt: message.timestamp,
              lastMessageSenderId: message.senderId,
              unreadCount: isRead ? room.unreadCount : (room.unreadCount || 0) + 1,
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

    ws.connect(
      handleIncomingMessage,
      () => setIsConnected(true),
      (err) => console.error("Websocket Error", err)
    );

    return () => {
      ws.disconnect();
      wsServiceRef.current = null;
    };
  }, [accessToken, currentUserId]);

  const sendMessage = (roomId: string, content: string) => {
    if (wsServiceRef.current) {
      wsServiceRef.current.sendMessage(roomId, content);
    }
  };

  return (
    <ChatContext.Provider value={{
      rooms,
      setRooms,
      isLoadingRooms,
      isConnected,
      sendMessage,
      messagesByRoom,
      setMessagesByRoom,
      totalUnreadCount,
      setActiveRoomId,
      resetUnreadCount
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
};
