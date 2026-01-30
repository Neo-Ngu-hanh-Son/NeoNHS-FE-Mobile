import { View, ImageBackground, TouchableOpacity, Dimensions } from "react-native";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 16px padding on each side + 16px gap

type DestinationCardProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  size?: "small" | "large";
  onPress?: () => void;
};

export default function DestinationCard({
  title,
  subtitle,
  imageUrl,
  size = "small",
  onPress,
}: DestinationCardProps) {
  const isLarge = size === "large";
  const cardHeight = isLarge ? 160 : 130;
  const cardWidth = isLarge ? SCREEN_WIDTH - 32 : CARD_WIDTH;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="rounded-xl overflow-hidden"
      style={{ width: cardWidth, height: cardHeight }}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        className="flex-1"
        imageStyle={{ borderRadius: 12 }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          className="flex-1 justify-end"
        >
          <View className="p-3">
            <Text className="text-white text-base font-bold mb-0.5" numberOfLines={2}>
              {title}
            </Text>
            <Text className="text-white/80 text-xs" numberOfLines={1}>
              {subtitle}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}
