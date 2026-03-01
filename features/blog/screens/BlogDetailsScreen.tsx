import { useEffect, useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import BlogHeader from '../components/BlogHeader';
import BlogContent from '../components/BlogContent';
import { blogService } from '../services/blogService';
import { logger } from '@/utils/logger';

import type { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import type { BlogResponse } from '../types/blog';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingOverlay from '@/components/Loader/LoadingOverlay';

type Props = StackScreenProps<MainStackParamList, 'BlogDetails'>;

export default function BlogDetailsScreen({ navigation, route }: Props) {
  const { blogId } = route.params;

  const [blog, setBlog] = useState<BlogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await blogService.getBlogById(blogId);
      setBlog(response.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load blog post';
      logger.error('[BlogDetailsScreen]', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  if (loading) {
    return <LoadingOverlay visible={loading} />;
  }

  if (error || !blog) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text variant="muted">{error ?? 'Blog post not found.'}</Text>
        <Button variant="outline" onPress={fetchBlog}>
          <Text>Retry</Text>
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-12"
        showsVerticalScrollIndicator={false}>
        <BlogHeader blog={blog} />
        <BlogContent html={blog.contentHTML ?? ''} />
      </ScrollView>
    </SafeAreaView>
  );
}
