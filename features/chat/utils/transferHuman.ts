import type { ChatMessage } from '../types';

/** Model / backend handover tag (see AiChatServiceImpl system prompt). */
export const TRANSFER_MARKER = '[TRANSFER_TO_HUMAN]';

/** Legacy exact prompt some backends still persist. */
export const LEGACY_TRANSFER_PROMPT =
  'Câu hỏi vượt quá khả năng trả lời của tôi bạn có muốn trò chuyện với Admin để được giải đáp không';

export function stripTransferMarker(content: string): string {
  if (!content) return content;
  return content.replace(/\s*\[TRANSFER_TO_HUMAN\]\s*/gi, '').trimEnd();
}

export function hasTransferMarker(content: string | undefined): boolean {
  if (!content) return false;
  return content.toUpperCase().includes('[TRANSFER_TO_HUMAN]');
}

export function isTransferSuggestedByMetadata(metadata: Record<string, unknown> | null | undefined): boolean {
  if (!metadata) return false;
  return Boolean(metadata.transferToHuman === true || metadata.transfer_to_human === true);
}

/** Whether this persisted AI message should show “talk to human” actions. */
export function isTransferOfferMessage(message: ChatMessage, currentUserId: string): boolean {
  const isAiSender = message.senderId === 'AI_ASSISTANT';
  if (!isAiSender) return false;
  if (isTransferSuggestedByMetadata(message.metadata ?? undefined)) return true;
  const c = message.content ?? '';
  if (c === LEGACY_TRANSFER_PROMPT) return true;
  return hasTransferMarker(c);
}
