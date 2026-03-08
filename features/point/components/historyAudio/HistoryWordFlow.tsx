import { View } from 'react-native';
import { HistoryWordToken } from './HistoryWordToken';
import { WordTiming } from '../../types';

type HistoryWordFlowProps = {
  words: WordTiming[];
  activeIndex: number;
};

export default function HistoryWordFlow({ words, activeIndex }: HistoryWordFlowProps) {
  return (
    <View className="flex-row flex-wrap items-start">
      {words.map((word, index) => {
        if (word.text === ' ') return null;
        return (
          <HistoryWordToken
            key={`${word.text}-${word.start}-${index}`}
            word={word}
            index={index}
            activeIndex={activeIndex}
          />
        );
      })}
    </View>
  );
}
