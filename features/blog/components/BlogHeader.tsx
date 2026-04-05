import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Separator } from '@/components/ui/separator';
import type { BlogResponse } from '../types/blog';
import { THEME } from '@/lib/theme';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { parseIntoVNDate } from '@/utils/date';
import { SmartImage } from '@/components/ui/smart-image';

interface BlogHeaderProps {
  blog: BlogResponse;
}

export default function BlogHeader({ blog }: BlogHeaderProps) {
  const coverImage = blog.bannerUrl || blog.thumbnailUrl;
  const authorName = blog.user?.fullname ?? 'Unknown';
  const categoryName = blog.blogCategory?.name;
  const { goBack } = useNavigation();
  const { getCurrentTheme } = useTheme();

  const formattedDate = blog.publishedAt ? parseIntoVNDate(blog.publishedAt) : null;

  return (
    <View className="gap-3">
      <View className="relative">
        {/* Cover image */}
        <SmartImage
          uri={coverImage}
          className="h-52 w-full"
          resizeMode="cover"
          accessibilityLabel={`Cover image for ${blog.title}`}
        />

        {/* Back button */}
        <View className="absolute left-4 top-4 rounded-full bg-white/20 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            onPress={goBack}
            accessibilityLabel="Go back"
            className="rounded-full bg-black/30">
            <Ionicons name="arrow-back" size={22} color="white" />
          </Button>
        </View>
      </View>

      <View
        className="gap-3 px-4 py-4"
        style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          marginTop: -50,
          backgroundColor: getCurrentTheme().background,
          zIndex: 10,
        }}>
        {/* Title */}
        <Text variant="h3" className="mt-2">
          {blog.title}
        </Text>

        {/* Short desc*/}
        <Text variant="muted">{blog.summary}</Text>

        {/* Meta row */}
        <View className="flex-row items-center gap-2">
          <Text variant="muted">{authorName}</Text>
          {formattedDate && (
            <>
              <Text variant="muted">•</Text>
              <Text variant="muted">{formattedDate}</Text>
            </>
          )}
        </View>

        {/* Optional category badge */}
        {categoryName ? (
          <View className="self-start rounded-full bg-primary/10 px-3 py-1">
            <Text className="text-xs font-medium text-primary">{categoryName}</Text>
          </View>
        ) : null}
        <Separator className="mt-1" />
      </View>
    </View>
  );
}
