import { apiClient } from "@/services/api/client";
import { API_CONFIG } from "@/utils/constants";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { ChatMessage, ChatRoom } from "../types";

// Page Response generic for pagination
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// Adjust based on your API Base URL structure. 
// Assuming API_CONFIG.BASE_URL is 'http://localhost:8080/api'
const API_BASE_URL = API_CONFIG.BASE_URL;
const SOCKET_URL = API_BASE_URL.replace("/api", "/ws");

/**
 * REST Service for chat endpoints
 */
export const ChatRestService = {
  createRoom: async (
    participantIds: string[],
    name: string | null = null
  ): Promise<ChatRoom> => {
    const res = await apiClient.post<ChatRoom>("chat/rooms", {
      name,
      participantIds,
    });
    return res.data;
  },

  getMyRooms: async (): Promise<ChatRoom[]> => {
    const res = await apiClient.get<any>("chat/rooms");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.content)) return data.content;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  },

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

  getChatParticipantInfo: async (userId: string): Promise<any> => {
    const res = await apiClient.get<any>(`chat/users/${userId}`);
    return res.data;
  },
};

/**
 * WebSocket Service for STOMP communication
 */
export class ChatWebSocketService {
  private stompClient: Client | null = null;
  private token: string;
  private subscription: any | null = null;
  private isConnected = false;

  constructor(token: string) {
    this.token = token;
  }

  connect(
    onMessageReceived: (message: ChatMessage) => void,
    onConnected?: () => void,
    onError?: (error: any) => void
  ) {
    if (this.isConnected) return;

    // Must attach token as query parameter
    const socketUrlWithToken = `${SOCKET_URL}?token=${encodeURIComponent(
      this.token
    )}`;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(socketUrlWithToken),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        // console.log("[STOMP]", str);
      },
    });

    this.stompClient.onConnect = (frame) => {
      this.isConnected = true;
      if (onConnected) onConnected();

      // Subscribe to the incoming user message queue
      this.subscription = this.stompClient!.subscribe(
        "/user/queue/messages",
        (messagePayload) => {
          const message = JSON.parse(messagePayload.body) as ChatMessage;
          onMessageReceived(message);
        }
      );
    };

    this.stompClient.onStompError = (frame) => {
      console.error("STOMP Broker Error:", frame.headers["message"], frame.body);
      if (onError) onError(frame);
    };

    this.stompClient.activate();
  }

  sendMessage(chatRoomId: string, content: string) {
    if (this.stompClient && this.stompClient.connected) {
      this.stompClient.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ chatRoomId, content }),
      });
    } else {
      console.error("Cannot send message: STOMP client is not connected");
    }
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
    }
    this.isConnected = false;
  }
}
