import { View, Image, TouchableOpacity, Dimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 16px padding on each side + 16px gap

type GuideCardProps = {
  title: string;
  description: string;
  imageUrl: string;
  onPress?: () => void;
};

export default function GuideCard({
  title,
  description,
  imageUrl,
  onPress,
}: GuideCardProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{ width: CARD_WIDTH }}
    >
      <Card className="p-0 gap-0 overflow-hidden">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-24"
          style={{ backgroundColor: theme.muted }}
        />
        <View className="p-2.5">
          <Text className="text-sm font-semibold mb-0.5" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="muted" className="text-xs" numberOfLines={1}>
            {description}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
