import { Text } from '@/components/ui/text';
import { View } from 'react-native';
import { PointHistoryAudioResponse } from '../../types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRef } from 'react';
import { TriggerRef } from '@rn-primitives/select';

export default function HistoryHeader({
  historyAudios,
  initialAudioIndex,
  onAudioChange,
  selectedAudioId,
  selectedAudioLabel,
}: {
  historyAudios: PointHistoryAudioResponse[];
  initialAudioIndex: number;
  onAudioChange: (index: number) => void;
  selectedAudioId: string;
  selectedAudioLabel: string;
}) {
  const ref = useRef<TriggerRef>(null);
  // Workaround for rn-primitives/select not opening on mobile
  function onTouchStart() {
    ref.current?.open();
  }
  return (
    <View className="gap-1.5">
      <Select
        className="text-md"
        value={selectedAudioId ? { value: selectedAudioId, label: selectedAudioLabel } : undefined}
        onValueChange={(val) => {
          const index = historyAudios.findIndex((a) => a.id === val?.value);
          if (index !== -1) onAudioChange(index);
        }}>
        <SelectTrigger className="bg-white">
          <SelectValue className="text-md" placeholder="Select an audio file" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectLabel>Audio file</SelectLabel>
            {historyAudios?.map((audio, index) => (
              <SelectItem
                key={audio.id}
                label={audio.metadata.title + ' - ' + audio.metadata.language}
                value={audio.id}></SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
}
