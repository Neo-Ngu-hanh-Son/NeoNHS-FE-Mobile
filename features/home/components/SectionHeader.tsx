import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";

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
    <View className="flex-row items-center justify-between px-4 mt-6 mb-3">
      <Text className="text-primary text-base font-bold">{title}</Text>
      {showSeeAll && (
        <Button variant="link" onPress={onSeeAllPress} className="p-0 h-auto">
          <Text className="text-primary text-sm font-medium">See All</Text>
        </Button>
      )}
    </View>
  );
}
