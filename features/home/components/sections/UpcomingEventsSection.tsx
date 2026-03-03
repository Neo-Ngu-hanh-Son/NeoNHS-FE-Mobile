import { ScrollView, View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import type { EventResponse } from '@/features/event/types';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import ExperienceCard from '../ExperienceCard';
import SectionHeader from '../SectionHeader';

type Props = {
  events: EventResponse[];
  loading: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function UpcomingEventsSection({ events, loading }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();

  function handleSeeMoreExperiences(): void {
    navigate('Main', { screen: 'AllDestinations', params: { initialTab: 'Events' } });
  }

  function handleExperiencePress(id: string): void {
    navigate('Main', { screen: 'EventDetail', params: { eventId: id } });
  }

  if (events == null || events.length === 0) {
    return null;
  }

  return (
    <View className="mb-4">
      <SectionHeader title="Upcoming events" showSeeAll onSeeAllPress={handleSeeMoreExperiences} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}>
        {events.map((event) => (
          <ExperienceCard
            key={event.id}
            title={event.name}
            tag="Event"
            imageUrl={event.thumbnailUrl ?? ''}
            onPress={() => handleExperiencePress(event.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
