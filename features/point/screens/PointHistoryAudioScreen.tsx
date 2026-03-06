import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useProgress } from 'react-native-track-player';
import { Text } from '@/components/ui/text';
import { CompositeScreenProps } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { MainStackParamList, TabsStackParamList } from '@/app/navigations/NavigationParamTypes';
import ScreenLayout from '@/components/common/ScreenLayout';

type HistoryWord = {
  text: string;
  start: number;
  end: number;
};

const SAMPLE_WORDS: HistoryWord[] = [
  { text: 'Neo', start: 0, end: 0.45 },
  { text: 'NHS', start: 0.46, end: 0.9 },
  { text: 'was', start: 0.91, end: 1.2 },
  { text: 'founded', start: 1.21, end: 1.8 },
  { text: 'to', start: 1.81, end: 2.0 },
  { text: 'preserve', start: 2.01, end: 2.55 },
  { text: 'the', start: 2.56, end: 2.74 },
  { text: 'region', start: 2.75, end: 3.14 },
  { text: 'cultural', start: 3.15, end: 3.68 },
  { text: 'identity,', start: 3.69, end: 4.16 },
  { text: 'while', start: 4.17, end: 4.52 },
  { text: 'creating', start: 4.53, end: 4.98 },
  { text: 'new', start: 4.99, end: 5.2 },
  { text: 'spaces', start: 5.21, end: 5.62 },
  { text: 'for', start: 5.63, end: 5.8 },
  { text: 'learning', start: 5.81, end: 6.22 },
  { text: 'and', start: 6.23, end: 6.4 },
  { text: 'discovery.', start: 6.41, end: 6.95 },
];

function HistoryHeader() {
  return (
    <View className="mb-5 gap-1.5">
      <Text variant="h3" className="text-foreground">
        History Audio Transcript
      </Text>
      <Text variant="muted" className="text-muted-foreground">
        Words highlight in sync with the active playback position.
      </Text>
    </View>
  );
}

type HistoryWordTokenProps = {
  word: HistoryWord;
  index: number;
  activeIndex: number;
};

function HistoryWordToken({ word, index, activeIndex }: HistoryWordTokenProps) {
  const isActive = index === activeIndex;
  const isPast = activeIndex >= 0 && index < activeIndex;

  return (
    <Text
      className={[
        'rounded-md px-1 py-0.5 text-base leading-7 text-muted-foreground',
        isPast ? 'text-muted-foreground/70' : '',
        isActive ? 'bg-secondary font-semibold text-foreground' : '',
      ]
        .filter(Boolean)
        .join(' ')}>
      {word.text}
    </Text>
  );
}

type HistoryWordFlowProps = {
  words: HistoryWord[];
  activeIndex: number;
};

function HistoryWordFlow({ words, activeIndex }: HistoryWordFlowProps) {
  return (
    <View className="flex-row flex-wrap items-start gap-x-1 gap-y-2">
      {words.map((word, index) => (
        <HistoryWordToken
          key={`${word.text}-${word.start}-${index}`}
          word={word}
          index={index}
          activeIndex={activeIndex}
        />
      ))}
    </View>
  );
}

type Props = CompositeScreenProps<
  StackScreenProps<MainStackParamList, 'PointHistoryAudio'>,
  StackScreenProps<TabsStackParamList>
>;

export default function PointHistoryAudioScreen({ route, navigation }: Props) {
  const { position } = useProgress(100);

  const activeIndex = useMemo(() => {
    return SAMPLE_WORDS.findIndex((word) => position >= word.start && position <= word.end);
  }, [position]);

  return (
    <ScreenLayout showBackButton>
      <ScrollView contentContainerClassName="p-5 pb-10">
        <HistoryHeader />

        <View className="rounded-xl border border-border bg-card p-4">
          <HistoryWordFlow words={SAMPLE_WORDS} activeIndex={activeIndex} />
        </View>

        <View className="mt-5 rounded-xl border border-border bg-card/70 p-4">
          <Text className="text-sm text-muted-foreground">Current playback position</Text>
          <Text className="mt-1 text-lg font-semibold text-foreground">{position.toFixed(2)}s</Text>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
