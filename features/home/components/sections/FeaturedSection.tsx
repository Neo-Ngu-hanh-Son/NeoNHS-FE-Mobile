import { View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import type { BlogResponse } from '@/features/blog/types';
import SectionHeader from '../SectionHeader';
import FeaturedCard from '../FeaturedEventCard';
import BlogCardSkeleton from '@/components/common/BlogCardSkeleton';

type Props = {
  featuredBlog: BlogResponse | null;
  loading: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function FeaturedSection({ featuredBlog, loading }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();

  function handleHeroPress(): void {
    if (!featuredBlog?.id) {
      return;
    }

    navigate('Main', { screen: 'BlogDetails', params: { blogId: featuredBlog.id } });
  }

  if (loading || !featuredBlog) {
    return (
      <View>
        <SectionHeader title="Featured" />
        <BlogCardSkeleton horizontal />
      </View>
    );
  }

  return (
    <View>
      <FeaturedCard
        tag={featuredBlog.blogCategory?.name || 'General'}
        title={featuredBlog.title}
        description={featuredBlog.summary || ''}
        imageUrl={featuredBlog.thumbnailUrl || ''}
        onPress={handleHeroPress}
      />
    </View>
  );
}
