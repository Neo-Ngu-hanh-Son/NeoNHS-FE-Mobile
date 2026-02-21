import React, { memo, useMemo } from 'react';
import { Image, Pressable, View } from 'react-native';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import type { Blog } from '@/features/blog/types';

interface BlogCardProps {
  blog: Blog;
  onPress?: (blog: Blog) => void;
}

function BlogCardComponent({ blog, onPress }: BlogCardProps) {
  const formattedDate = useMemo(() => {
    if (!blog.publishedAt) {
      return 'Unpublished';
    }

    return new Date(blog.publishedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [blog.publishedAt]);

  const authorName = blog.user?.fullname ?? 'Unknown';

  return (
    <Pressable onPress={() => onPress?.(blog)} accessibilityRole="button">
      <Card className="mb-3 gap-0 overflow-hidden border-border py-0">
        <View className="flex-row">
          {blog.thumbnailUrl ? (
            <Image
              source={{ uri: blog.thumbnailUrl }}
              className="h-28 w-28 bg-muted"
              resizeMode="cover"
            />
          ) : (
            <View className="h-28 w-28 bg-muted" />
          )}

          <View className="flex-1 px-3 py-2">
            <Text className="text-base font-semibold text-foreground" numberOfLines={2}>
              {blog.title}
            </Text>

            <Text className="mt-1 text-sm text-muted-foreground" numberOfLines={2}>
              {blog.summary ?? 'No summary available'}
            </Text>

            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {authorName}
              </Text>
              <Text className="text-xs text-muted-foreground">{formattedDate}</Text>
            </View>

            <Text className="mt-1 text-xs text-muted-foreground">{blog.viewCount} views</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const BlogCard = memo(BlogCardComponent);

export default BlogCard;
