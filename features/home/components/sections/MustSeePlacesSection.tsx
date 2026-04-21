import { ScrollView, View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import type { MapPoint } from '@/features/map';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import PlaceCard from '../PlaceCard';
import SectionHeader from '../SectionHeader';
import SectionStateMessage from './SectionStateMessage';
import { useTranslation } from 'react-i18next';

type Props = {
  destinations: MapPoint[];
  loading: boolean;
  error?: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function MustSeePlacesSection({ destinations, loading, error }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();
  const { t } = useTranslation();

  function handleExploreAllDestinations(): void {
    navigate('Main', { screen: 'AllDestinations', params: {} });
  }

  function handlePlacePress(id: string): void {
    navigate('Main', { screen: 'PointDetail', params: { pointId: id } });
  }

  if (error) {
    return (
      <View className="mb-4">
        <SectionHeader
          title={t('home.must_see_places')}
          showSeeAll
          onSeeAllPress={handleExploreAllDestinations}
        />
        <SectionStateMessage
          tone="error"
          message="Failed to fetch destinations. Please pull to refresh."
        />
      </View>
    );
  }

  if (!loading && (destinations == null || destinations.length === 0)) {
    return (
      <View className="mb-4">
        <SectionHeader
          title={t('home.must_see_places')}
          showSeeAll
          onSeeAllPress={handleExploreAllDestinations}
        />
        <SectionStateMessage message="No destinations found." />
      </View>
    );
  }

  return (
    <View className="mb-4">
      <SectionHeader
        title={t('home.must_see_places')}
        showSeeAll
        onSeeAllPress={handleExploreAllDestinations}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}>
        {destinations.map((place) => (
          <PlaceCard
            key={place.id}
            name={place.name}
            imageUrl={place.thumbnailUrl}
            onPress={() => handlePlacePress(place.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
