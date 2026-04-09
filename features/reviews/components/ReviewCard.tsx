import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import { formatTimeAgo } from '../utils';
import type { Review } from '../types';

export interface ReviewCardProps {
  item: Review;
  isOwn: boolean;
  onEdit?: () => void;
  onReport?: () => void;
}

export function ReviewCard({ item, isOwn, onEdit, onReport }: ReviewCardProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;
  const avatarUri = item.user.avatarUrl ?? undefined;

  return (
    <Card className="rounded-2xl py-4">
      <CardContent className="gap-3 px-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-row items-center gap-3">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} className="h-10 w-10 rounded-full" contentFit="cover" />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.muted,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="person" size={20} color={theme.mutedForeground} />
              </View>
            )}
            <View>
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-bold">{item.user.fullname}</Text>
                {isOwn && (
                  <View
                    style={{
                      backgroundColor: theme.primary,
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 1,
                    }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>YOU</Text>
                  </View>
                )}
              </View>
              <Text className="text-[11px] text-muted-foreground">{formatTimeAgo(item.createdAt)}</Text>
            </View>
          </View>
          {
            /* Action Button: Edit for own reviews, Report for others */
            isOwn && onEdit ? (
              <TouchableOpacity className="p-1" onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="pencil-outline" size={16} color={theme.primary} />
              </TouchableOpacity>
            ) : !isOwn && onReport ? (
              <TouchableOpacity className="p-1" onPress={onReport}>
                <Ionicons name="ellipsis-vertical" size={16} color={theme.mutedForeground} />
              </TouchableOpacity>
            ) : null
          }
        </View>

        <View className="flex-row gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons key={i} name={i < item.rating ? 'star' : 'star-outline'} size={12} color="#f97316" />
          ))}
        </View>

        {!!item.comment && <Text className="text-sm leading-6 text-muted-foreground">{item.comment}</Text>}

        {item.imageUrls && item.imageUrls.length > 0 && (
          <View className="flex-row flex-wrap gap-2">
            {item.imageUrls.slice(0, 3).map((url, idx) => (
              <Image
                key={idx}
                source={{ uri: url }}
                style={{ width: 64, height: 64, borderRadius: 8 }}
                contentFit="cover"
              />
            ))}
          </View>
        )}
      </CardContent>
    </Card>
  );
}
