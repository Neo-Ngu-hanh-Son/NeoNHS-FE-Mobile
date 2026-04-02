import { View, Text } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import type { BlogResponse } from '@/features/blog/types';
import SectionHeader from '../SectionHeader';
import FeaturedCard from '../FeaturedEventCard';
import BlogCardSkeleton from '@/components/common/BlogCardSkeleton';
import SectionStateMessage from './SectionStateMessage';

type Props = {
  featuredBlog: BlogResponse | null | undefined;
  loading: boolean;
  error?: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function FeaturedSection({ featuredBlog, loading, error }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();

  function handleHeroPress(): void {
    if (!featuredBlog?.id) {
      return;
    }

    navigate('Main', { screen: 'BlogDetails', params: { blogId: featuredBlog.id } });
  }

  if (error) {
    return (
      <View className="mb-4">
        <SectionHeader title="Featured" />
        <SectionStateMessage
          tone="error"
          message="Failed to fetch featured content. Please pull to refresh."
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="mb-4">
        <SectionHeader title="Featured" />
        <BlogCardSkeleton horizontal />
      </View>
    );
  }

  if (!featuredBlog) {
    return (
      <View className="mb-4">
        <SectionHeader title="Featured" />
        <SectionStateMessage message="No featured content found." />
      </View>
    );
  }

  return (
    <View className="mb-4">
      <SectionHeader title="Featured" />
      <FeaturedCard
        tag={featuredBlog.blogCategory?.name || 'General'}
        title={featuredBlog.title}
        description={featuredBlog.summary || ''}
        imageUrl={featuredBlog.thumbnailUrl ?? featuredBlog.bannerUrl}
        onPress={handleHeroPress}
      />
    </View>
  );
}
