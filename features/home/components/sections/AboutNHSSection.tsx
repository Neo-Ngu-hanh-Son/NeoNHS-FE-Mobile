import { View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import type { BlogResponse } from '@/features/blog/types';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import HighlightCard from '../HighlightCard';
import SectionHeader from '../SectionHeader';

type Props = {
  overviews: BlogResponse[];
  loading: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function AboutNHSSection({ overviews, loading }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();

  function handleHighlightPress(id: string): void {
    navigate('Main', { screen: 'BlogDetails', params: { blogId: id } });
  }

  if (!loading && overviews.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <SectionHeader title="About Ngu Hanh Son" />
      <View className="gap-3">
        {overviews.map((overview) => (
          <HighlightCard
            key={overview.id}
            title={overview.title}
            description={overview.summary ?? ''}
            imageUrl={overview.thumbnailUrl ?? overview.bannerUrl ?? ''}
            linkText="Learn More"
            onPress={() => handleHighlightPress(overview.id)}
          />
        ))}
      </View>
    </View>
  );
}
