import { ChatRoomWithDetails, ChatMessage, ChatParticipant } from "../types";

export const MOCK_CURRENT_USER_ID = "user-me";

export const MOCK_PARTICIPANTS: Record<string, ChatParticipant> = {
  "user-vendor": {
    id: "user-vendor",
    fullname: "Pottery Studio Vendor",
    avatarUrl: "https://i.pravatar.cc/150?img=33",
    role: "VENDOR",
  },
  "user-guide": {
    id: "user-guide",
    fullname: "Alex Johnson",
    avatarUrl: "https://i.pravatar.cc/150?img=11",
    role: "TOURIST",
  },
  "user-empty": {
    id: "user-empty",
    fullname: "Sarah Smith",
    avatarUrl: null,
    role: "TOURIST",
  },
};

export const MOCK_ROOMS: ChatRoomWithDetails[] = [
  {
    id: "room-1",
    name: null,
    participants: ["user-me", "user-vendor"],
    createdAt: "2026-03-20T10:00:00.000Z",
    lastMessageAt: "2026-03-29T08:32:00.000Z",
    lastMessagePreview: "Looking forward to seeing you at the workshop!",
    lastMessageSenderId: "user-vendor",
    otherParticipant: MOCK_PARTICIPANTS["user-vendor"],
  },
  {
    id: "room-2",
    name: "Group Trip",
    participants: ["user-me", "user-guide", "user-empty"],
    createdAt: "2026-03-25T14:30:00.000Z",
    lastMessageAt: "2026-03-28T16:15:00.000Z",
    lastMessagePreview: "What time are we meeting?",
    lastMessageSenderId: "user-me",
    otherParticipant: MOCK_PARTICIPANTS["user-guide"], // Faking typical 1-on-1 logic for the avatar
  },
  {
    id: "room-3",
    name: null,
    participants: ["user-me", "user-empty"],
    createdAt: "2026-03-28T09:00:00.000Z",
    lastMessageAt: "2026-03-28T09:05:00.000Z",
    lastMessagePreview: "Sounds good.",
    lastMessageSenderId: "user-empty",
    otherParticipant: MOCK_PARTICIPANTS["user-empty"],
  },
];

export const MOCK_MESSAGES_ROOM_1: ChatMessage[] = [
  // Older messages first, we will reverse them for the inverted FlatList,
  // or we can sort them newest first. The API states messages come newest first.
  {
    id: "msg-4",
    chatRoomId: "room-1",
    senderId: "user-vendor",
    content: "Looking forward to seeing you at the workshop!",
    timestamp: "2026-03-29T08:32:00.000Z",
    status: "DELIVERED",
  },
  {
    id: "msg-3",
    chatRoomId: "room-1",
    senderId: "user-me",
    content: "Got it, that's perfect. Thanks!",
    timestamp: "2026-03-29T08:30:00.000Z",
    status: "READ",
  },
  {
    id: "msg-2",
    chatRoomId: "room-1",
    senderId: "user-vendor",
    content: "No, all materials are provided.",
    timestamp: "2026-03-29T08:15:00.000Z",
    status: "READ",
  },
  {
    id: "msg-1.5",
    chatRoomId: "room-1",
    senderId: "user-vendor",
    content: "We provide the clay and all tools.",
    timestamp: "2026-03-29T08:14:30.000Z",
    status: "READ",
  },
  {
    id: "msg-1",
    chatRoomId: "room-1",
    senderId: "user-me",
    content: "Hello! Do I need to bring anything to the pottery session?",
    timestamp: "2026-03-29T08:12:00.000Z",
    status: "READ",
  },
  {
    id: "msg-0",
    chatRoomId: "room-1",
    senderId: "user-vendor",
    content: "Hi there! Welcome to my workshop.",
    timestamp: "2026-03-28T10:00:00.000Z", // Previous day
    status: "READ",
  },
];
