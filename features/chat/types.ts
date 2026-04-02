export interface ChatParticipant {
  id: string;
  fullname: string;
  avatarUrl: string | null;
  role: string;
}

export interface ChatRoom {
  id: string;
  name: string | null;
  participants: string[];
  createdAt: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: "SENT" | "DELIVERED" | "READ";
}

export interface ChatRoomWithDetails extends ChatRoom {
  otherParticipant?: ChatParticipant;
}
