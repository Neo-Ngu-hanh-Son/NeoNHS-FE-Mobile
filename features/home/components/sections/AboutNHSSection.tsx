import { View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import type { BlogResponse } from '@/features/blog/types';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import HighlightCard from '../HighlightCard';
import SectionHeader from '../SectionHeader';
import SectionStateMessage from './SectionStateMessage';
import { useTranslation } from 'react-i18next';

type Props = {
  overviews: BlogResponse[];
  loading: boolean;
  error?: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function AboutNHSSection({ overviews, loading, error }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();
  const { t } = useTranslation();

  function handleHighlightPress(id: string): void {
    navigate('Main', { screen: 'BlogDetails', params: { blogId: id } });
  }

  if (error) {
    return (
      <View className="mb-4">
        <SectionHeader title={t('home.about_nhs')} />
        <SectionStateMessage
          tone="error"
          message="Failed to fetch overview content. Please pull to refresh."
        />
      </View>
    );
  }

  if (!loading && (overviews == null || overviews.length === 0)) {
    return (
      <View className="mb-4">
        <SectionHeader title={t('home.about_nhs')} />
        <SectionStateMessage message="No overview content found." />
      </View>
    );
  }

  return (
    <View className="mb-4">
      <SectionHeader title={t('home.about_nhs')} />
      <View className="gap-3">
        {overviews.map((overview) => (
          <HighlightCard
            key={overview.id}
            title={overview.title}
            description={overview.summary ?? ''}
            imageUrl={overview.thumbnailUrl ?? overview.bannerUrl}
            linkText={t('home.learn_more')}
            onPress={() => handleHighlightPress(overview.id)}
          />
        ))}
      </View>
    </View>
  );
}
