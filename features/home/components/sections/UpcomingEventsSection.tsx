import { ScrollView, View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import type { EventResponse } from '@/features/event/types';
import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import ExperienceCard from '../ExperienceCard';
import SectionHeader from '../SectionHeader';
import SectionStateMessage from './SectionStateMessage';
import { useTranslation } from 'react-i18next';

type Props = {
  events: EventResponse[];
  loading: boolean;
  error?: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function UpcomingEventsSection({ events, loading, error }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();
  const { t } = useTranslation();

  function handleSeeMoreExperiences(): void {
    navigate('Main', { screen: 'AllDestinations', params: { initialTab: 'Events' } });
  }

  function handleExperiencePress(id: string): void {
    navigate('Main', { screen: 'EventDetail', params: { eventId: id } });
  }

  if (error) {
    return (
      <View className="mb-4">
        <SectionHeader title={t('home.upcoming_events')} showSeeAll onSeeAllPress={handleSeeMoreExperiences} />
        <SectionStateMessage
          tone="error"
          message="Failed to fetch upcoming events. Please pull to refresh."
        />
      </View>
    );
  }

  if (!loading && (events == null || events.length === 0)) {
    return (
      <View className="mb-4">
        <SectionHeader title={t('home.upcoming_events')} showSeeAll onSeeAllPress={handleSeeMoreExperiences} />
        <SectionStateMessage message="No upcoming events found." />
      </View>
    );
  }

  return (
    <View className="mb-4">
      <SectionHeader title={t('home.upcoming_events')} showSeeAll onSeeAllPress={handleSeeMoreExperiences} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}>
        {events.map((event) => (
          <ExperienceCard
            key={event.id}
            title={event.name}
            tag="Event"
            imageUrl={event.thumbnailUrl}
            onPress={() => handleExperiencePress(event.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
