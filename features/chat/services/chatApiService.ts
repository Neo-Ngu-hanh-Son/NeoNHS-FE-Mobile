import { apiClient } from "@/services/api/client";
import { API_CONFIG } from "@/utils/constants";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ChatMessage, ChatRoom, RoomType, MessageType, ReadReceiptEvent } from "../types";

// ── Pagination generic ─────────────────────────────────
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

const API_BASE_URL = API_CONFIG.BASE_URL;
const SOCKET_URL = API_BASE_URL.replace("/api", "/ws");

// ════════════════════════════════════════════════════════
// REST Service
// ════════════════════════════════════════════════════════
export const ChatRestService = {
  /**
   * Create (or reopen) a chat room.
   * For SYSTEM_SUPPORT: backend auto-assigns an admin; no participantIds needed.
   */
  createRoom: async (
    roomType: RoomType = "STANDARD",
    participantIds: string[] = [],
    name: string | null = null
  ): Promise<ChatRoom> => {
    const body: Record<string, any> = { name, roomType };
    if (participantIds.length > 0) {
      body.participantIds = participantIds;
    }
    const res = await apiClient.post<ChatRoom>("chat/rooms", body);
    return res.data;
  },

  /** List the current user's rooms (backend returns enriched DTOs). */
  getMyRooms: async (): Promise<ChatRoom[]> => {
    const res = await apiClient.get<any>("chat/rooms");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  },

  /** Paginated message history (newest-first). */
  getRoomMessages: async (
    roomId: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<ChatMessage>> => {
    const res = await apiClient.get<PageResponse<ChatMessage>>(
      `/chat/rooms/${roomId}/messages?page=${page}&size=${size}`
    );
    return res.data;
  },

  /** Participant info (name, avatar, role). */
  getChatParticipantInfo: async (userId: string): Promise<any> => {
    const res = await apiClient.get<any>(`chat/users/${userId}`);
    return res.data;
  },

  /** Hide / unhide (archive) a room. */
  toggleRoomVisibility: async (roomId: string, isHidden: boolean): Promise<void> => {
    await apiClient.patch(`chat/rooms/${roomId}/visibility`, { isHidden });
  },

  /** Upload an image and get back a Cloudinary URL. */
  uploadMedia: async (imageUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as any);

    const res = await apiClient.post<{ mediaUrl: string }>("chat/media", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    } as any);
    return res.data.mediaUrl;
  },
};

// ════════════════════════════════════════════════════════
// WebSocket Service
// ════════════════════════════════════════════════════════
export class ChatWebSocketService {
  private stompClient: Client | null = null;
  private token: string;
  private globalSubscription: any | null = null;
  private typingSubscription: any | null = null;
  private isConnected = false;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Connect and set up the global `/user/queue/messages` subscription.
   * The callback now receives a union: either a ChatMessage or a ReadReceiptEvent.
   */
  connect(
    onPayloadReceived: (payload: ChatMessage | ReadReceiptEvent) => void,
    onConnected?: () => void,
    onError?: (error: any) => void
  ) {
    if (this.isConnected) return;

    const socketUrlWithToken = `${SOCKET_URL}?token=${encodeURIComponent(this.token)}`;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrlWithToken),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: () => {},
    });

    this.stompClient.onConnect = () => {
      this.isConnected = true;
      onConnected?.();

      this.globalSubscription = this.stompClient!.subscribe(
        "/user/queue/messages",
        (frame) => {
          const data = JSON.parse(frame.body);
          onPayloadReceived(data);
        }
      );
    };

    this.stompClient.onStompError = (frame) => {
      console.error("STOMP Broker Error:", frame.headers["message"], frame.body);
      onError?.(frame);
    };

    this.stompClient.activate();
  }

  // ── Send a message (TEXT / IMAGE / PRODUCT_SNIPPET) ──
  sendMessage(
    chatRoomId: string,
    content: string,
    messageType: MessageType = "TEXT",
    mediaUrl?: string | null,
    metadata?: Record<string, any> | null
  ) {
    if (!this.stompClient?.connected) {
      console.error("Cannot send: STOMP client not connected");
      return;
    }
    this.stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ chatRoomId, content, messageType, mediaUrl, metadata }),
    });
  }

  // ── Typing indicators ────────────────────────────────
  sendTypingStart(chatRoomId: string) {
    this.stompClient?.connected &&
      this.stompClient.publish({
        destination: "/app/chat.typing.start",
        body: JSON.stringify({ chatRoomId }),
      });
  }

  sendTypingStop(chatRoomId: string) {
    this.stompClient?.connected &&
      this.stompClient.publish({
        destination: "/app/chat.typing.stop",
        body: JSON.stringify({ chatRoomId }),
      });
  }

  /**
   * Subscribe to typing events for a specific room.
   * Returns a cleanup function.
   */
  subscribeToRoomTyping(
    roomId: string,
    onTyping: (data: { isTyping: boolean; senderId: string }) => void
  ): () => void {
    if (!this.stompClient?.connected) return () => {};

    this.typingSubscription?.unsubscribe();
    this.typingSubscription = this.stompClient.subscribe(
      `/topic/room/${roomId}/typing`,
      (frame) => {
        onTyping(JSON.parse(frame.body));
      }
    );

    return () => {
      this.typingSubscription?.unsubscribe();
      this.typingSubscription = null;
    };
  }

  // ── Read receipts ────────────────────────────────────
  sendReadReceipt(chatRoomId: string, lastReadMessageId: string) {
    this.stompClient?.connected &&
      this.stompClient.publish({
        destination: "/app/chat.read",
        body: JSON.stringify({ chatRoomId, lastReadMessageId }),
      });
  }

  // ── Disconnect ───────────────────────────────────────
  disconnect() {
    this.typingSubscription?.unsubscribe();
    this.typingSubscription = null;
    this.globalSubscription?.unsubscribe();
    this.globalSubscription = null;
    this.stompClient?.deactivate();
    this.stompClient = null;
    this.isConnected = false;
  }
}
