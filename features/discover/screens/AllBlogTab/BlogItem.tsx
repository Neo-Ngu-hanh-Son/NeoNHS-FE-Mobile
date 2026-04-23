import React, { memo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartImage } from '@/components/ui/smart-image';
import type { Blog } from '@/features/blog/types';

const BlogItem = memo(({ item, theme, onPress }: {
  item: Blog;
  theme: any;
  onPress: (id: string) => void;
}) => {
  const publishedDate = item.publishedAt || item.createdAt;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="mx-4 mt-3 flex-row items-center gap-4 rounded-3xl border p-3.5"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }}
      onPress={() => onPress(item.id)}
    >
      <SmartImage
        uri={item.thumbnailUrl || item.bannerUrl}
        className="h-20 w-20 rounded-2xl object-cover"
      />
      <View className="flex-1 justify-center">
        <Text
          className="text-base font-bold tracking-tight"
          numberOfLines={2}
          style={{ color: theme.foreground }}
        >
          {item.title}
        </Text>

        {item.summary && (
          <Text
            className="text-xs mt-1 leading-4"
            numberOfLines={2}
            style={{ color: theme.mutedForeground }}
          >
            {item.summary}
          </Text>
        )}

        {/* Author + Date row */}
        <View className="mt-1.5 flex-row items-center gap-2">
          {item.user?.avatarUrl && (
            <SmartImage
              uri={item.user.avatarUrl}
              className="h-4 w-4 rounded-full"
            />
          )}
          <Text className="text-[11px] font-semibold" style={{ color: theme.primary }}>
            {item.user?.fullname || 'NeoNHS'}
          </Text>
          {publishedDate && (
            <>
              <Text className="text-[10px]" style={{ color: theme.mutedForeground }}>•</Text>
              <Text className="text-[10px]" style={{ color: theme.mutedForeground }}>
                {new Date(publishedDate).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.mutedForeground} />
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id &&
    prevProps.theme.card === nextProps.theme.card;
});

BlogItem.displayName = 'BlogItem';
export default BlogItem;
