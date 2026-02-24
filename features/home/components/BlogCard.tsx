import { View, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import type { BlogResponse } from '@/features/blog/types/blog';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.6;

type BlogCardProps = {
  blog: BlogResponse;
  onPress?: () => void;
};

export default function BlogCard({ blog, onPress }: BlogCardProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  const coverImage = blog.thumbnailUrl || blog.bannerUrl;
  const authorName = blog.user?.fullname ?? 'Unknown';
  const categoryName = blog.blogCategory?.name;

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.container,
        {
          width: CARD_WIDTH,
          backgroundColor: theme.card,
          // Subtle shadow
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        },
      ]}>
      {coverImage ? (
        <Image
          source={{ uri: coverImage }}
          style={[styles.image, { backgroundColor: theme.muted }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, { backgroundColor: theme.muted }]} />
      )}

      <View style={styles.content}>
        <Text
          className="text-base font-bold leading-5"
          style={{ color: theme.foreground }}
          numberOfLines={2}>
          {blog.title}
        </Text>
        <View className="mt-1 flex-row items-center gap-1">
          <Text className="text-xs" style={{ color: theme.mutedForeground }}>
            {authorName}
          </Text>
          {formattedDate && (
            <>
              <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                •
              </Text>
              <Text className="text-xs" style={{ color: theme.mutedForeground }}>
                {formattedDate}
              </Text>
            </>
          )}
        </View>
        {categoryName ? (
          <View
            className="mt-2 self-start rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${theme.primary}15` }}>
            <Text className="text-xs font-medium" style={{ color: theme.primary }}>
              {categoryName}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: 120,
  },
  content: {
    padding: 12,
  },
});
