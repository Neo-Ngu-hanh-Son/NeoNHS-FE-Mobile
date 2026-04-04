import { ScrollView, View } from 'react-native';
import { CompositeScreenProps, useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

import { RootStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import type { WorkshopTemplateResponse } from '@/features/workshops/types';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/app/providers/ThemeProvider';
import { THEME } from '@/lib/theme';
import ExperienceCard from '../ExperienceCard';
import SectionHeader from '../SectionHeader';
import SectionStateMessage from './SectionStateMessage';

type Props = {
  workshops: WorkshopTemplateResponse[];
  loading: boolean;
  error?: boolean;
};

type HomeScreenProps = CompositeScreenProps<
  StackScreenProps<TabsStackParamList, 'Home'>,
  StackScreenProps<RootStackParamList>
>;

export default function UpcomingWorkshopsSection({ workshops, loading, error }: Props) {
  const { navigate } = useNavigation<HomeScreenProps['navigation']>();
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  function handleSeeMoreWorkshops(): void {
    navigate('Main', { screen: 'AllDestinations', params: { initialTab: 'Workshops' } });
  }

  function handleWorkshopPress(id: string): void {
    navigate('Main', { screen: 'WorkshopDetail', params: { workshopId: id } });
  }

  if (error) {
    return (
      <View className="mb-4">
        <SectionHeader
          title="Upcoming workshops"
          showSeeAll
          onSeeAllPress={handleSeeMoreWorkshops}
        />
        <SectionStateMessage
          tone="error"
          message="Failed to fetch upcoming workshops. Please pull to refresh."
        />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="mb-4">
        <SectionHeader title="Upcoming workshops" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}>
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="mr-3 h-48 w-40 rounded-xl" />
          ))}
        </ScrollView>
      </View>
    );
  }

  if (workshops == null || workshops.length === 0) {
    return (
      <View className="mb-4">
        <SectionHeader
          title="Upcoming workshops"
          showSeeAll
          onSeeAllPress={handleSeeMoreWorkshops}
        />
        <View className="px-4">
          <SectionStateMessage message="No workshops found." />
        </View>
      </View>
    );
  }

  return (
    <View className="mb-4">
      <SectionHeader
        title="Upcoming workshops"
        showSeeAll
        onSeeAllPress={handleSeeMoreWorkshops}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}>
        {workshops.map((workshop) => {
          const thumbnail = workshop.images.find((img) => img.isThumbnail) || workshop.images[0];
          return (
            <ExperienceCard
              key={workshop.id}
              title={workshop.name}
              tag="Workshop"
              imageUrl={thumbnail?.imageUrl}
              onPress={() => handleWorkshopPress(workshop.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
