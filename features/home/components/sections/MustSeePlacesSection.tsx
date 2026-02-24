import { ScrollView, View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import type { MapPoint } from '@/features/map';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import PlaceCard from '../PlaceCard';
import SectionHeader from '../SectionHeader';

type Props = {
  destinations: MapPoint[];
  loading: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function MustSeePlacesSection({ destinations, loading }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();

  function handleExploreAllDestinations(): void {
    navigate('Main', { screen: 'AllDestinations', params: {} });
  }

  function handlePlacePress(id: string): void {
    navigate('Main', { screen: 'PointDetail', params: { pointId: id } });
  }

  if (!loading && destinations.length === 0) {
    return null;
  }

  return (
    <View>
      <SectionHeader
        title="Must-See Places"
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
            imageUrl={place.thumbnailUrl ?? ''}
            onPress={() => handlePlacePress(place.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
