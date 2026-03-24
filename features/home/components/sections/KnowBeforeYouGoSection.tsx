import { Pressable, ScrollView, View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import type { BlogResponse } from '@/features/blog/types';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import GuideCard from '../GuideCard';
import SectionHeader from '../SectionHeader';
import SectionStateMessage from './SectionStateMessage';

type Props = {
  guides: BlogResponse[];
  loading: boolean;
  error?: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function KnowBeforeYouGoSection({ guides, loading, error }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();

  function handleGuidePress(id: string): void {
    navigate('Main', { screen: 'BlogDetails', params: { blogId: id } });
  }

  if (error) {
    return (
      <View className="mb-4">
        <SectionHeader title="Know Before You Go" />
        <SectionStateMessage
          tone="error"
          message="Failed to fetch guides. Please pull to refresh."
        />
      </View>
    );
  }

  if (!loading && (guides == null || guides.length === 0)) {
    return (
      <View className="mb-4">
        <SectionHeader title="Know Before You Go" />
        <SectionStateMessage message="No guides found." />
      </View>
    );
  }

  return (
    <View className="mb-4">
      <SectionHeader title="Know Before You Go" />
      <View style={{ height: 240 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            gap: 16,
          }}>
          {guides.map((guide) => (
            <GuideCard
              key={guide.id}
              title={guide.title}
              description={guide.summary ?? ''}
              imageUrl={guide.thumbnailUrl ?? guide.bannerUrl ?? ''}
              onPress={() => handleGuidePress(guide.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
