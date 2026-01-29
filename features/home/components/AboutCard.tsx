import { View, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

type AboutCardProps = {
  tag?: string;
  title: string;
  description: string;
  imageUrl: string;
  linkText?: string;
  onPress?: () => void;
};

export default function AboutCard({
  tag = "ABOUT",
  title,
  description,
  imageUrl,
  linkText = "Explore History",
  onPress,
}: AboutCardProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card className="flex-row mx-4 p-0 gap-0 overflow-hidden">
        <Image
          source={{ uri: imageUrl }}
          className="w-28 h-36"
          style={{ backgroundColor: theme.muted }}
        />
        <View className="flex-1 p-3 justify-center">
          <Text className="text-primary text-[10px] font-semibold tracking-wide mb-1">
            {tag}
          </Text>
          <Text className="text-primary text-base font-bold mb-1" numberOfLines={2}>
            {title}
          </Text>
          <Text variant="muted" className="text-xs leading-4 mb-2" numberOfLines={3}>
            {description}
          </Text>
          <Button variant="link" className="p-0 h-auto self-start gap-1" onPress={onPress}>
            <Text className="text-primary text-sm font-semibold">{linkText}</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.primary} />
          </Button>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
