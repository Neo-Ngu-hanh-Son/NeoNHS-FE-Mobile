import React, { useState, useCallback } from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { SmartImage } from '@/components/ui/smart-image';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import { useQuery } from '@tanstack/react-query';

import RefreshableScreenLayout from '@/components/common/RefreshableScreenLayout';
import FullScreenLoader from '@/components/Loader/FullScreenLoader';
import FullScreenError from '@/components/Loader/FullScreenError';

import HistoryHeader from '../components/historyAudio/HistoryHeader';
import HistoryWordFlow from '../components/historyAudio/HistoryWordFlow';
import AudioPlayer from '../components/historyAudio/AudioPlayer';
import { getPointHistoryAudiosOfPointId } from '../services/PointHistoryAudioService';

type Props = CompositeScreenProps<
  StackScreenProps<MainStackParamList, 'PointHistoryAudio'>,
  StackScreenProps<TabsStackParamList>
>;

export default function PointHistoryAudioScreen({ route }: Props) {
  const { pointId } = route.params;

  // ─── Data fetching ───
  const {
    data: historyAudios = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['pointHistoryAudios', pointId],
    queryFn: async () => {
      const response = await getPointHistoryAudiosOfPointId(pointId);
      return response.data;
    },
    enabled: !!pointId,
  });

  // ─── Audio selection ───
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedAudio = historyAudios[selectedIndex];

  // ─── Active word index for highlighting ───
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleActiveIndexChange = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  // ─── Loading state ───
  if (isLoading) {
    return <FullScreenLoader />;
  }

  // ─── Error state ───
  if (isError) {
    return <FullScreenError onRetry={refetch} message={error?.message} />;
  }

  if (!selectedAudio) {
    return (
      <FullScreenError onRetry={refetch} message="No history audio is available for this point." />
    );
  }

  // ─── Main content ───
  return (
    <RefreshableScreenLayout
      showBackButton={true}
      onRefresh={() => refetch()}
      title="History audio transcript"
      contentContainerClassName="px-5 pb-10 pt-16">
      {/* Header + audio selector */}
      <HistoryHeader
        historyAudios={historyAudios}
        initialAudioIndex={selectedIndex}
        onAudioChange={(index) => setSelectedIndex(index)}
        selectedAudioId={selectedAudio?.id}
        selectedAudioLabel={
          selectedAudio
            ? selectedAudio.metadata.title + ' - ' + selectedAudio.metadata.language
            : ''
        }
      />

      {/* Transcript (word flow) */}
      <View className="mt-5 rounded-2xl border border-border bg-card p-5">
        {selectedAudio.metadata.coverImage ? (
          <SmartImage uri={selectedAudio.metadata.coverImage} className="mb-4 h-40 w-full rounded-xl" />
        ) : null}

        <View className="mb-3 flex-col items-start justify-start gap-2">
          <Text variant={'h4'}>{selectedAudio.metadata.title}</Text>
          <Text variant={'small'} className="text-muted-foreground">
            By: {selectedAudio.metadata.artist}
          </Text>
        </View>
        <ScrollView
          style={{ maxHeight: 200 }}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}>
          <HistoryWordFlow words={selectedAudio?.words || []} activeIndex={activeIndex} />
        </ScrollView>
      </View>

      {/* Player */}
      <View className="mt-5">
        <AudioPlayer
          audioUrl={selectedAudio?.audioUrl}
          onActiveIndexChange={handleActiveIndexChange}
          audio={selectedAudio}
        />
      </View>
    </RefreshableScreenLayout>
  );
}
