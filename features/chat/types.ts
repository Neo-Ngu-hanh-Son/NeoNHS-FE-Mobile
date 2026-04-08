// ── Room Types ─────────────────────────────────────────
export type RoomType = 'STANDARD' | 'SYSTEM_SUPPORT' | 'VENDOR_CHAT';

// ── Message Types ──────────────────────────────────────
export type MessageType = 'TEXT' | 'IMAGE' | 'PRODUCT_SNIPPET';

// ── Participant ────────────────────────────────────────
export interface ChatParticipant {
  id: string;
  fullname: string;
  avatarUrl: string | null;
  role: string;
}

// ── Room ───────────────────────────────────────────────
export interface ChatRoom {
  id: string;
  name: string | null;
  participants: string[];
  roomType?: RoomType;
  createdAt: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  /** Per-user unread count provided by the backend */
  unreadCount?: number;
  /** Whether this room has been archived/hidden by the current user */
  isHidden?: boolean;
}

// ── Message ────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  /** Type of message content */
  messageType?: MessageType;
  /** Cloudinary URL for IMAGE type messages */
  mediaUrl?: string | null;
  /** Extra data for PRODUCT_SNIPPET messages */
  metadata?: {
    workshopId?: string;
    title?: string;
    price?: number;
    thumbnailUrl?: string;
    [key: string]: any;
  } | null;

  // ── Transient local-only fields (not from server) ────
  /** True while the image is still uploading to Cloudinary */
  _isUploading?: boolean;
  /** Local file URI shown as a blurred preview during upload */
  _localUri?: string;
}

// ── Read Receipt Event (from WebSocket) ────────────────
export interface ReadReceiptEvent {
  type: 'READ_RECEIPT';
  readerId: string;
  lastReadMessageId: string;
  chatRoomId: string;
}

// ── Enriched Room (with resolved participant) ──────────
export interface ChatRoomWithDetails extends ChatRoom {
  otherParticipant?: ChatParticipant;
}

// ── Product Snippet data passed via navigation ─────────
export interface ProductSnippetParams {
  workshopId: string;
  title: string;
  price: number;
  thumbnailUrl: string;
}
