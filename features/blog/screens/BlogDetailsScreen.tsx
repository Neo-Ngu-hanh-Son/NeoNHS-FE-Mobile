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
