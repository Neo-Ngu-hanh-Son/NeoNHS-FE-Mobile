import { View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';

type SectionHeaderProps = {
  title: string;
  showSeeAll?: boolean;
  onSeeAllPress?: () => void;
};

export default function SectionHeader({
  title,
  showSeeAll = false,
  onSeeAllPress,
}: SectionHeaderProps) {
  return (
    <View className="mb-3 mt-6 flex-row items-center justify-between px-4">
      <Text className="text-xl font-bold text-primary">{title}</Text>
      {showSeeAll && (
        <Button variant="link" onPress={onSeeAllPress} className="h-auto p-0">
          <Text className="text-sm font-medium text-primary">See All</Text>
        </Button>
      )}
    </View>
  );
}
