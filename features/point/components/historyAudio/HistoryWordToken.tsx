import { WordTiming } from '../../types';
import { Text } from '@/components/ui/text';

type HistoryWordTokenProps = {
  word: WordTiming;
  index: number;
  activeIndex: number;
};

export const HistoryWordToken = ({ word, index, activeIndex }: HistoryWordTokenProps) => {
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
};
