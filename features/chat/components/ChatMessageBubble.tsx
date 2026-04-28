import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Modal, Dimensions, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SmartImage } from '@/components/ui/smart-image';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import Markdown from 'react-native-markdown-display';

import { ChatMessage } from '../types';

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
  timestampString: string;
  participantAvatar?: string | null;
  onProductSnippetPress?: (id: string, type?: 'workshop' | 'event') => void;
  onGoToCart?: () => void;
  onGoToMap?: (pointId: string) => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

type AttachedCard = {
  id: string;
  type: 'workshop' | 'event' | 'blog' | 'point' | string;
  title: string;
  imageUrl?: string;
};

const extractCardMeta = (raw: string | undefined | null) => {
  if (!raw) {
    return { title: '', id: null as string | null, type: null as string | null };
  }

  const normalized = raw.trim();
  const title = normalized.split('|')[0]?.trim() ?? '';

  if ((normalized.startsWith('{') && normalized.endsWith('}')) || (normalized.startsWith('[') && normalized.endsWith(']'))) {
    try {
      const json = JSON.parse(normalized);
      const parsedId = json.id || json.pointId || json.workshopId || json.eventId || null;
      const parsedType = (json.type || (json.pointId ? 'point' : json.eventId ? 'event' : json.workshopId ? 'workshop' : null) || '')
        .toString()
        .trim()
        .toLowerCase();
      const parsedTitle = (json.title || json.name || title || '').toString().trim();
      const normalizedType = ['location', 'destination', 'place', 'map_point'].includes(parsedType) ? 'point' : parsedType;
      return {
        title: parsedTitle,
        id: parsedId ? parsedId.toString().trim() : null,
        type: normalizedType || null,
      };
    } catch {
      // Fall through to plain-text parser.
    }
  }

  const idMatch =
    normalized.match(/(?:^|[\|,;])\s*id\s*:\s*([^\|,;\]]+)/i) ||
    normalized.match(/(?:^|[\|,;])\s*pointId\s*:\s*([^\|,;\]]+)/i) ||
    normalized.match(/(?:^|[\|,;])\s*eventId\s*:\s*([^\|,;\]]+)/i) ||
    normalized.match(/(?:^|[\|,;])\s*workshopId\s*:\s*([^\|,;\]]+)/i);
  const typeMatch = normalized.match(/(?:^|[\|,;])\s*type\s*:\s*([^\|,;\]]+)/i);
  let inferredType: string | null = null;
  if (!typeMatch) {
    if (/pointId\s*:/i.test(normalized)) inferredType = 'point';
    else if (/eventId\s*:/i.test(normalized)) inferredType = 'event';
    else if (/workshopId\s*:/i.test(normalized)) inferredType = 'workshop';
  }

  const matchedType = (typeMatch?.[1]?.trim().toLowerCase() || inferredType || null) as string | null;
  const normalizedType = matchedType && ['location', 'destination', 'place', 'map_point'].includes(matchedType)
    ? 'point'
    : matchedType;
  return {
    title,
    id: idMatch?.[1]?.trim() || null,
    type: normalizedType,
  };
};

const stripMarkdownImages = (text: string | undefined | null): string => {
  if (!text) return '';
  return text
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/^\s*[-*•]\s*$/gm, '') // remove orphan bullet lines
    .replace(/^\s*\d+\.\s*$/gm, '') // remove orphan numbered markers
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const hasMarkdownImage = (text: string | undefined | null): boolean => {
  if (!text) return false;
  return /!\[[^\]]*]\([^)]+\)/.test(text);
};

const splitByNumberedSections = (text: string): string[] => {
  const lines = text.split('\n');
  const sections: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^\s*\d+\.\s+/.test(line) && current.length > 0) {
      sections.push(current.join('\n').trim());
      current = [line];
      continue;
    }
    current.push(line);
  }

  if (current.length > 0) {
    sections.push(current.join('\n').trim());
  }

  return sections.filter(Boolean);
};

const normalizeForMatch = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/y/g, 'i') // improve matching for variants like mỹ/mĩ
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const splitByCardTitleAnchors = (text: string, cards: AttachedCard[]): string[] => {
  const lines = text.split('\n');
  const titleNorms = cards.map((c) => normalizeForMatch(c.title)).filter(Boolean);
  if (titleNorms.length === 0) return [];

  const anchorIdx: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const n = normalizeForMatch(lines[i]);
    if (!n) continue;
    if (titleNorms.some((t) => n.includes(t) || t.includes(n))) {
      anchorIdx.push(i);
    }
  }

  if (anchorIdx.length < 2) return [];
  const uniqueAnchors = Array.from(new Set(anchorIdx)).sort((a, b) => a - b);
  const sections: string[] = [];
  for (let i = 0; i < uniqueAnchors.length; i++) {
    const start = uniqueAnchors[i];
    const end = i + 1 < uniqueAnchors.length ? uniqueAnchors[i + 1] : lines.length;
    const section = lines.slice(start, end).join('\n').trim();
    if (section) sections.push(section);
  }
  return sections;
};

const splitNumberedSectionBodyAndTail = (section: string): { body: string; tail: string } => {
  const lines = section.split('\n');
  if (lines.length <= 1 || !/^\s*\d+\.\s+/.test(lines[0])) {
    return { body: section.trim(), tail: '' };
  }

  let cut = lines.length;
  let sawListLine = false;

  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) continue;

    const isListLine = /^[-*•]\s+/.test(line) || /^-\s+/.test(line);
    const isIndented = /^\s+/.test(raw);

    if (isListLine || isIndented) {
      sawListLine = true;
      continue;
    }

    if (sawListLine) {
      cut = i;
      break;
    }
  }

  const body = lines.slice(0, cut).join('\n').trim();
  const tail = lines.slice(cut).join('\n').trim();
  return { body, tail };
};

// ── Main component ─────────────────────────────────────
const ChatMessageBubbleBase = ({
  message,
  isMine,
  showAvatar,
  showTimestamp,
  timestampString,
  participantAvatar,
  onProductSnippetPress,
  onGoToCart,
  onGoToMap,
}: ChatMessageBubbleProps) => {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const msgType = message.messageType ?? 'TEXT';
  const hasAttachedCardsRaw = Array.isArray(message.metadata?.attachedCards) && message.metadata!.attachedCards!.length > 0;

  const markdownStyle = useMemo(() => ({
    body: {
      color: isMine ? '#FFFFFF' : theme.foreground,
      fontSize: 15,
      lineHeight: 20,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 0,
    },
    link: {
      color: isMine ? '#E5E7EB' : theme.primary,
      textDecorationLine: 'underline' as const,
    },
    strong: {
      fontWeight: 'bold' as const,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    code_inline: {
      backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
      borderRadius: 4,
      paddingHorizontal: 4,
    },
    image: {
      borderRadius: 12,
      width: SCREEN_WIDTH * 0.65,
      height: 150,
      marginTop: 8,
      marginBottom: 8,
      backgroundColor: isDarkColorScheme ? '#374151' : '#F3F4F6',
    },
  }), [isMine, theme, isDarkColorScheme]);

  const markdownRules = useMemo(() => ({
    image: (node: any) => {
      const { src, alt, title: markdownTitle } = node.attributes;
      const rawMeta = alt || markdownTitle || '';
      const parsedMeta = extractCardMeta(rawMeta);
      const title = parsedMeta.title || alt || '';
      const id = parsedMeta.id;
      const type = parsedMeta.type || 'workshop';
      const isPoint = type === 'point';
      const lowerMeta = normalizeText(rawMeta);
      const isMapImage =
        lowerMeta.includes('map') ||
        lowerMeta.includes('vi tri') ||
        lowerMeta.includes('chi duong') ||
        lowerMeta.includes('direction');

      // If cards are present, do not render any markdown images to avoid duplicates.
      if (hasAttachedCardsRaw) {
        return null;
      }

      if (id) {
        return (
          <TouchableOpacity
            key={node.key}
            activeOpacity={0.8}
            onPress={() => {
              if (isPoint) {
                onGoToMap?.(id);
              } else {
                onProductSnippetPress?.(id, type as any);
              }
            }}
            className="flex-row items-center p-2 my-2 rounded-xl border"
            style={{
              width: '100%',
              backgroundColor: isDarkColorScheme ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
              borderColor: theme.border,
            }}>
            <SmartImage
              uri={src}
              className="rounded-lg"
              style={{ width: 60, height: 60 }}
            />
            <View className="flex-1 ml-3">
              <Text
                className="text-xs font-bold"
                style={{ color: theme.foreground }}
                numberOfLines={2}>
                {title}
              </Text>
              <Text className="text-[10px] font-bold mt-1" style={{ color: theme.primary }}>
                {isPoint ? 'Nhấn để xem đường đi →' : 'Nhấn để xem chi tiết →'}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }

      if (isMapImage) {
        return (
          <View key={node.key} className="my-2 items-start">
            <SmartImage
              uri={src}
              className="rounded-xl"
              style={{ width: 120, height: 90 }}
            />
            {title ? <Text className="text-[10px] mt-1" style={{ color: theme.mutedForeground }}>{title}</Text> : null}
          </View>
        );
      }

      return (
        <SmartImage
          key={node.key}
          uri={src}
          className="rounded-xl"
          style={(markdownStyle as any).image}
        />
      );
    },
  }), [theme, isDarkColorScheme, onGoToMap, onProductSnippetPress, markdownStyle, hasAttachedCardsRaw]);

  const attachedCards = useMemo<AttachedCard[]>(() => {
    const raw = message.metadata?.attachedCards;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item: any) => ({
        id: String(item?.id ?? '').trim(),
        type: String(item?.type ?? '').trim().toLowerCase(),
        title: String(item?.title ?? '').trim(),
        imageUrl: String(item?.imageUrl ?? '').trim(),
      }))
      .filter((c) => !!c.id && !!c.title && !!c.type);
  }, [message.metadata?.attachedCards]);

  const isDirectionResponse = useMemo(
    () => Boolean(message.metadata?.redirectToMap || message.metadata?.targetPointId),
    [message.metadata?.redirectToMap, message.metadata?.targetPointId]
  );
  const hasPointCard = useMemo(() => attachedCards.some((c) => c.type === 'point'), [attachedCards]);
  const displayAttachedCards = useMemo<AttachedCard[]>(() => {
    if (attachedCards.length === 0) return [];

    // Direction UX: keep only one deterministic point card for explicit navigate replies.
    if (hasPointCard && isDirectionResponse) {
      const firstPoint = attachedCards.find((c) => c.type === 'point');
      return firstPoint ? [firstPoint] : [];
    }

    // For workshop/event/blog, cards come from metadata as source of truth.
    // Any duplicated markdown card syntax will be stripped from textContent.
    return attachedCards;
  }, [attachedCards, hasPointCard, isDirectionResponse]);

  const textContent = useMemo(() => {
    if (displayAttachedCards.length === 0) return message.content ?? '';

    // Cards exist => remove all markdown images from text.
    return stripMarkdownImages(message.content);
  }, [displayAttachedCards.length, message.content]);

  const renderAttachedCards = () => {
    if (displayAttachedCards.length === 0) return null;
    return (
      <View className="mt-2">
        {displayAttachedCards.map((card, idx) => {
          const isPoint = card.type === 'point';
          return (
            <TouchableOpacity
              key={`${card.type}:${card.id}:${idx}`}
              activeOpacity={0.8}
              onPress={() => {
                if (isPoint) {
                  onGoToMap?.(card.id);
                } else {
                  onProductSnippetPress?.(card.id, card.type === 'event' ? 'event' : 'workshop');
                }
              }}
              className="flex-row items-center p-2 my-2 rounded-xl border"
              style={{
                width: '100%',
                backgroundColor: isDarkColorScheme ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                borderColor: theme.border,
              }}>
              {card.imageUrl ? (
                <SmartImage
                  uri={card.imageUrl}
                  className="rounded-lg"
                  style={{ width: 60, height: 60 }}
                />
              ) : (
                <View
                  className="rounded-lg"
                  style={{ width: 60, height: 60, backgroundColor: isDarkColorScheme ? '#374151' : '#E5E7EB' }}
                />
              )}
              <View className="flex-1 ml-3">
                <Text
                  className="text-xs font-bold"
                  style={{ color: theme.foreground }}
                  numberOfLines={2}>
                  {card.title}
                </Text>
                <Text className="text-[10px] font-bold mt-1" style={{ color: theme.primary }}>
                  {isPoint ? 'Nhấn để xem đường đi →' : 'Nhấn để xem chi tiết →'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderAttachedCardsInlineWithText = () => {
    if (displayAttachedCards.length === 0 || !textContent || (hasPointCard && isDirectionResponse)) return null;

    let sections = splitByNumberedSections(textContent);
    if (sections.length <= 1) {
      sections = splitByCardTitleAnchors(textContent, displayAttachedCards);
    }
    if (sections.length <= 1) return null;

    const usedCardIndexes = new Set<number>();
    return (
      <View>
        {sections.map((section, idx) => {
          const normalizedSection = normalizeForMatch(section);
          let card: AttachedCard | undefined;
          let selectedIndex = -1;

          for (let i = 0; i < displayAttachedCards.length; i++) {
            if (usedCardIndexes.has(i)) continue;
            const c = displayAttachedCards[i];
            const normalizedTitle = normalizeForMatch(c.title);
            if (normalizedTitle && normalizedSection.includes(normalizedTitle)) {
              card = c;
              selectedIndex = i;
              break;
            }
          }

          // Fallback: for numbered sections, map by first unused card
          if (!card && /^\s*\d+\.\s+/.test(section)) {
            for (let i = 0; i < displayAttachedCards.length; i++) {
              if (!usedCardIndexes.has(i)) {
                card = displayAttachedCards[i];
                selectedIndex = i;
                break;
              }
            }
          }

          if (selectedIndex >= 0) {
            usedCardIndexes.add(selectedIndex);
          }
          const isPoint = card?.type === 'point';
          const split = splitNumberedSectionBodyAndTail(section);
          return (
            <View key={`sec-${idx}`}>
              <Markdown
                style={markdownStyle}
                onLinkPress={(url: string) => {
                  if (url.startsWith('neo-nhs://')) {
                    const parts = url.replace('neo-nhs://', '').split('/');
                    const type = parts[0]?.toLowerCase();
                    const id = parts[1];
                    if (id) {
                      if (type === 'point') onGoToMap?.(id);
                      else onProductSnippetPress?.(id, type as any);
                    }
                    return false;
                  }
                  Linking.openURL(url).catch(() => { });
                  return true;
                }}
                rules={markdownRules}
              >
                {split.body}
              </Markdown>
              {card ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    if (isPoint) onGoToMap?.(card.id);
                    else onProductSnippetPress?.(card.id, card.type === 'event' ? 'event' : 'workshop');
                  }}
                  className="flex-row items-center p-2 my-2 rounded-xl border"
                  style={{
                    width: '100%',
                    backgroundColor: isDarkColorScheme ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                    borderColor: theme.border,
                  }}>
                  {card.imageUrl ? (
                    <SmartImage uri={card.imageUrl} className="rounded-lg" style={{ width: 60, height: 60 }} />
                  ) : (
                    <View
                      className="rounded-lg"
                      style={{ width: 60, height: 60, backgroundColor: isDarkColorScheme ? '#374151' : '#E5E7EB' }}
                    />
                  )}
                  <View className="flex-1 ml-3">
                    <Text className="text-xs font-bold" style={{ color: theme.foreground }} numberOfLines={2}>
                      {card.title}
                    </Text>
                    <Text className="text-[10px] font-bold mt-1" style={{ color: theme.primary }}>
                      {isPoint ? 'Nhấn để xem đường đi →' : 'Nhấn để xem chi tiết →'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : null}
              {split.tail ? (
                <Markdown
                  style={markdownStyle}
                  onLinkPress={(url: string) => {
                    if (url.startsWith('neo-nhs://')) {
                      const parts = url.replace('neo-nhs://', '').split('/');
                      const type = parts[0]?.toLowerCase();
                      const id = parts[1];
                      if (id) {
                        if (type === 'point') onGoToMap?.(id);
                        else onProductSnippetPress?.(id, type as any);
                      }
                      return false;
                    }
                    Linking.openURL(url).catch(() => { });
                    return true;
                  }}
                  rules={markdownRules}
                >
                  {split.tail}
                </Markdown>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  };

  // ── Render bubble content by type ────────────────────
  const renderContent = () => {
    switch (msgType) {
      case 'IMAGE':
        if (message._isUploading) {
          // ── Uploading placeholder: gray frame with blurred local preview ──
          return (
            <View
              className="items-center justify-center overflow-hidden rounded-xl"
              style={{
                width: SCREEN_WIDTH * 0.55,
                height: SCREEN_WIDTH * 0.55,
                backgroundColor: isDarkColorScheme ? '#374151' : '#E5E7EB',
              }}>
              {message._localUri ? (
                <Image
                  source={{ uri: message._localUri }}
                  className="rounded-xl"
                  contentFit="cover"
                  style={{
                    width: SCREEN_WIDTH * 0.55,
                    height: SCREEN_WIDTH * 0.55,
                    opacity: 0.4,
                  }}
                />
              ) : null}
              <View
                className="absolute items-center justify-center"
                style={{
                  width: SCREEN_WIDTH * 0.55,
                  height: SCREEN_WIDTH * 0.55,
                }}>
                <View className="h-10 w-10 items-center justify-center rounded-full bg-black/30">
                  <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" />
                </View>
                <Text className="mt-2 text-xs font-medium" style={{ color: '#FFFFFF' }}>
                  Uploading...
                </Text>
              </View>
            </View>
          );
        }
        return (
          <>
            <TouchableOpacity onPress={() => setImageModalVisible(true)} activeOpacity={0.85}>
              <SmartImage
                uri={message.mediaUrl}
                className="rounded-xl"
                contentFit="cover"
                style={{ width: SCREEN_WIDTH * 0.55, height: SCREEN_WIDTH * 0.55 }}
              />
            </TouchableOpacity>
            {textContent ? (
              <View className="mt-1.5 px-2">
                {renderAttachedCardsInlineWithText() ?? (
                  <Markdown
                    style={markdownStyle}
                    onLinkPress={(url: string) => {
                      if (url.startsWith('neo-nhs://')) {
                        const parts = url.replace('neo-nhs://', '').split('/');
                        const rawType = (parts[0] || '').toLowerCase();
                        const id = parts[1];
                        if (id) {
                          if (rawType === 'point') {
                            onGoToMap?.(id);
                          } else {
                            const type = rawType === 'event' ? 'event' : 'workshop';
                            onProductSnippetPress?.(id, type);
                          }
                        }
                        return false;
                      }
                      Linking.openURL(url).catch(() => { });
                      return true;
                    }}
                    rules={markdownRules}
                  >
                    {textContent}
                  </Markdown>
                )}
              </View>
            ) : null}
            {!renderAttachedCardsInlineWithText() ? renderAttachedCards() : null}

            {/* Full-screen image modal */}
            <Modal visible={imageModalVisible} transparent animationType="fade">
              <View className="flex-1 items-center justify-center bg-black/90">
                <TouchableOpacity
                  className="absolute right-5 top-14 z-10 p-2"
                  onPress={() => setImageModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Image
                  source={{ uri: message.mediaUrl ?? undefined }}
                  contentFit="contain"
                  style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                />
              </View>
            </Modal>
          </>
        );

      case 'PRODUCT_SNIPPET': {
        const meta = message.metadata;
        return (
          <View className="p-1">
            {/* Clickable Card Snippet */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                const id = meta?.workshopId || meta?.eventId || meta?.pointId;
                const type = meta?.pointId ? 'point' : meta?.workshopId ? 'workshop' : 'event';
                if (id) {
                  if (type === 'point') {
                    onGoToMap?.(id);
                  } else {
                    onProductSnippetPress?.(id, type as any);
                  }
                }
              }}
              className="flex-row items-center p-2 rounded-xl border"
              style={{
                width: '100%',
                backgroundColor: isDarkColorScheme ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                borderColor: theme.border,
              }}>
              {meta?.thumbnailUrl && (
                <SmartImage
                  uri={meta.thumbnailUrl}
                  className="rounded-lg"
                  contentFit="cover"
                  style={{ width: 60, height: 60 }}
                />
              )}
              <View className="flex-1 ml-3">
                <Text
                  className="text-xs font-bold"
                  style={{ color: isMine ? '#FFFFFF' : theme.foreground }}
                  numberOfLines={2}>
                  {meta?.title ?? 'Product'}
                </Text>
                {meta?.price != null && (
                  <Text className="mt-1 text-[11px] font-semibold" style={{ color: theme.primary }}>
                    {typeof meta.price === 'number' ? meta.price.toLocaleString('vi-VN') : meta.price} ₫
                  </Text>
                )}
                <View className="mt-1">
                  <Text className="text-[10px] font-bold" style={{ color: theme.primary }}>
                    {meta?.pointId ? 'Nhấn để xem đường đi →' : 'Nhấn để xem chi tiết →'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* AI Explanation Text */}
            {textContent ? (
              <View className="mt-3 px-2 pb-1">
                {renderAttachedCardsInlineWithText() ?? (
                  <Markdown
                    style={{ ...markdownStyle, body: { ...markdownStyle.body, fontSize: 14, lineHeight: 20 } }}
                    onLinkPress={(url: string) => {
                      if (url.startsWith('neo-nhs://')) {
                        const parts = url.replace('neo-nhs://', '').split('/');
                        const type = parts[0]?.toLowerCase();
                        const id = parts[1];
                        if (id) {
                          if (type === 'point') {
                            onGoToMap?.(id);
                          } else {
                            onProductSnippetPress?.(id, type as any);
                          }
                        }
                        return false;
                      }
                      Linking.openURL(url).catch(() => { });
                      return true;
                    }}
                    rules={markdownRules}
                  >
                    {textContent}
                  </Markdown>
                )}
              </View>
            ) : null}
            {!renderAttachedCardsInlineWithText() ? renderAttachedCards() : null}
          </View>
        );
      }

      case 'LOCATION': {
        const meta = message.metadata;
        return (
          <TouchableOpacity
            activeOpacity={0.8}
            className="flex-row items-center p-2 min-w-[200px]"
            onPress={() => {
              // TODO: Navigate or open Map view
              // e.g. navigation.navigate('MapScreen', { lat: meta?.lat, lng: meta?.lng })
            }}>
            <View className="h-12 w-12 items-center justify-center rounded-xl bg-black/10 dark:bg-white/10 mr-3">
              <Ionicons name="location" size={26} color={isMine ? '#FFFFFF' : theme.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold" style={{ color: isMine ? '#FFFFFF' : theme.foreground }}>
                Vị trí đã chia sẻ
              </Text>
              {meta?.address ? (
                <Text className="text-xs mt-0.5" style={{ color: isMine ? '#E5E7EB' : theme.mutedForeground }} numberOfLines={2}>
                  {meta.address}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        );
      }

      default: // TEXT
        return (
          <View>
            {renderAttachedCardsInlineWithText() ?? (
              <Markdown
                style={markdownStyle}
                onLinkPress={(url: string) => {
                  if (url.startsWith('neo-nhs://')) {
                    const parts = url.replace('neo-nhs://', '').split('/');
                    const type = parts[0]?.toLowerCase();
                    const id = parts[1];
                    if (id) {
                      if (type === 'point') {
                        onGoToMap?.(id);
                      } else {
                        onProductSnippetPress?.(id, type as any);
                      }
                    }
                    return false;
                  }
                  Linking.openURL(url).catch(() => { });
                  return true;
                }}
                rules={markdownRules}
              >
                {textContent}
              </Markdown>
            )}
            {!renderAttachedCardsInlineWithText() ? renderAttachedCards() : null}
            {message.metadata?.redirectToCart && (
              <TouchableOpacity
                onPress={onGoToCart}
                className="mt-3 p-3 rounded-xl flex-row items-center justify-center shadow-sm"
                style={{ backgroundColor: theme.primary }}>
                <Ionicons name="cart" size={18} color="#FFF" />
                <Text className="ml-2 text-white font-bold text-sm">Tới Giỏ hàng Ngay</Text>
              </TouchableOpacity>
            )}
          </View>
        );
    }
  };

  const msgContent = message.content?.trim();
  const hasMedia = message.mediaUrl || message.metadata || message.messageType === 'IMAGE' || message.messageType === 'LOCATION' || message.messageType === 'PRODUCT_SNIPPET' || message._isUploading;

  if (!msgContent && !hasMedia) {
    return null;
  }

  return (
    <View className="mb-1">
      {/* Timestamp gap */}
      {showTimestamp && (
        <View className="my-4 items-center">
          <Text className="text-xs font-medium" style={{ color: theme.mutedForeground }}>
            {timestampString}
          </Text>
        </View>
      )}

      {/* Message Row */}
      <View className={`flex-row items-end px-4 ${isMine ? 'justify-end' : 'justify-start'}`}>
        {/* Other user avatar */}
        {!isMine && (
          <View className="mr-2">
            {showAvatar ? (
              message.senderId === 'AI_ASSISTANT' ? (
                <View className="h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: '#6366f1' }}>
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                </View>
              ) : participantAvatar ? (
                <SmartImage uri={participantAvatar} className="h-8 w-8 rounded-full bg-gray-200" />
              ) : (
                <View className="h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
                  <Ionicons name="person" size={16} color={theme.mutedForeground} />
                </View>
              )
            ) : (
              <View className="h-8 w-8" />
            )}
          </View>
        )}

        {/* Bubble */}
        <View
          className={`max-w-[75%] rounded-2xl ${isMine ? 'rounded-br-sm' : 'rounded-bl-sm'} ${msgType === 'IMAGE' || msgType === 'PRODUCT_SNIPPET' ? 'overflow-hidden p-1' : 'px-4 py-2.5'
            }`}
          style={{ backgroundColor: isMine ? theme.primary : theme.muted }}>
          {renderContent()}

          {/* Status ticks (only for own messages) */}
          {isMine && <View className="mr-1 mt-0.5 flex-row items-center justify-end"></View>}
        </View>
      </View>
    </View>
  );
};

export const ChatMessageBubble = React.memo(ChatMessageBubbleBase);
