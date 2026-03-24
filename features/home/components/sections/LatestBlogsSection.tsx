import { ScrollView, View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import type { BlogResponse } from '@/features/blog/types';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import BlogCard from '../BlogCard';
import SectionHeader from '../SectionHeader';
import SectionStateMessage from './SectionStateMessage';

type Props = {
  blogs: BlogResponse[];
  loading: boolean;
  error?: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function LatestBlogsSection({ blogs, loading, error }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();

  function handleViewAllBlogs(): void {
    navigate('Main', { screen: 'BlogList' });
  }

  function handleBlogPress(id: string): void {
    navigate('Main', { screen: 'BlogDetails', params: { blogId: id } });
  }

  if (error) {
    return (
      <View className="mb-4">
        <SectionHeader title="Latest Blogs" showSeeAll onSeeAllPress={handleViewAllBlogs} />
        <SectionStateMessage
          tone="error"
          message="Failed to fetch latest blogs. Please pull to refresh."
        />
      </View>
    );
  }

  if (!loading && (blogs == null || blogs.length === 0)) {
    return (
      <View className="mb-4">
        <SectionHeader title="Latest Blogs" showSeeAll onSeeAllPress={handleViewAllBlogs} />
        <SectionStateMessage message="No blogs found." />
      </View>
    );
  }

  return (
    <View className="mb-4">
      <SectionHeader title="Latest Blogs" showSeeAll onSeeAllPress={handleViewAllBlogs} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} onPress={() => handleBlogPress(blog.id)} />
        ))}
      </ScrollView>
    </View>
  );
}
