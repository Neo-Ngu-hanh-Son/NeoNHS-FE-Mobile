import { View, ImageBackground, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";

type PlaceCardProps = {
  name: string;
  imageUrl: string;
  onPress?: () => void;
};

export default function PlaceCard({
  name,
  imageUrl,
  onPress,
}: PlaceCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-36 h-44 rounded-xl overflow-hidden mr-3"
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        className="flex-1"
        imageStyle={{ borderRadius: 12 }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.6)"]}
          className="flex-1 justify-end p-3"
        >
          <Text className="text-white text-sm font-bold" numberOfLines={2}>
            {name}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}
