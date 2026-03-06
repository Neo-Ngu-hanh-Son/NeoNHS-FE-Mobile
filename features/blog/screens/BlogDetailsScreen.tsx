import { ScrollView, View } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import BlogHeader from '../components/BlogHeader';
import BlogContent from '../components/BlogContent';
import { useBlogDetail } from '../hooks/useBlogDetail';

import type { MainStackParamList } from '@/app/navigations/NavigationParamTypes';
import { SafeAreaView } from 'react-native-safe-area-context';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';
import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { blogService } from '../services/blogService';
import { BLOG_MINIMUM_READING_TIME_SECONDS } from '../constants';

type Props = StackScreenProps<MainStackParamList, 'BlogDetails'>;

export default function BlogDetailsScreen({ navigation, route }: Props) {
  const { blogId } = route.params;

  const { data: blog, isLoading, isError, error, refetch } = useBlogDetail(blogId);

  if (isLoading) {
    return <FullScreenLoader message="Loading blog post..." />;
  }

  if (isError || !blog) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background px-6">
        <Text variant="muted">{error?.message ?? 'Blog post not found.'}</Text>
        <Button variant="outline" onPress={() => refetch()}>
          <Text>Retry</Text>
        </Button>
      </View>
    );
  }

  useEffect(() => {
    if (!blogId) return;
    const timer = setTimeout(() => {
      blogService.incrementBlogView(blogId);
      console.log(`[BlogDetailsPage] Incremented view count for blog ID: ${blogId}`);
    }, BLOG_MINIMUM_READING_TIME_SECONDS * 1000);

    return () => clearTimeout(timer);
  }, [blogId]);

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
