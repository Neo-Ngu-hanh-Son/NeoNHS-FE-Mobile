import type { ChatMessage } from '../types';

/**
 * Merge REST history with in-memory messages: server wins for shared IDs so
 * pull-to-refresh picks up status updates and new fields; keep local-only rows
 * (e.g. optimistic upload placeholders with ids starting with "__").
 */
export function mergeServerChatHistory(historyMsgs: ChatMessage[], current: ChatMessage[]): ChatMessage[] {
  const msgMap = new Map<string, ChatMessage>();
  historyMsgs.forEach((m) => msgMap.set(m.id, m));
  current.forEach((m) => {
    if (m.id.startsWith('__')) {
      msgMap.set(m.id, m);
      return;
    }
    if (!msgMap.has(m.id)) {
      msgMap.set(m.id, m);
    }
  });
  return Array.from(msgMap.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function formatChatRoomTime(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();

  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  // Check if within the last 7 days
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatChatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return timeString; // "08:30 AM"
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ", " + timeString;
}

export function shouldShowTimestamp(currentMsgDate: string, previousMsgDate?: string): boolean {
  if (!previousMsgDate) return true;

  const current = new Date(currentMsgDate);
  const previous = new Date(previousMsgDate);
  const diffMinutes = (current.getTime() - previous.getTime()) / (1000 * 60);

  return diffMinutes > 10;
}
