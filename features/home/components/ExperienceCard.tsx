import { View, ImageBackground, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/app/providers/ThemeProvider";
import { THEME } from "@/lib/theme";

type ExperienceCardProps = {
  title: string;
  tag: "Workshop" | "Event" | "Tour";
  imageUrl: string;
  onPress?: () => void;
};

export default function ExperienceCard({
  title,
  tag,
  imageUrl,
  onPress,
}: ExperienceCardProps) {
  const { isDarkColorScheme } = useTheme();
  const theme = isDarkColorScheme ? THEME.dark : THEME.light;

  // Tag color based on type
  const getTagColor = () => {
    switch (tag) {
      case "Workshop":
        return "hsl(262, 83%, 58%)"; // Purple
      case "Event":
        return theme.primary; // Green
      case "Tour":
        return "hsl(221, 83%, 53%)"; // Blue
      default:
        return theme.primary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-40 h-48 rounded-xl overflow-hidden mr-3"
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        className="flex-1"
        imageStyle={{ borderRadius: 12 }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          className="flex-1 justify-end p-3"
        >
          {/* Tag */}
          <View
            className="self-start px-2 py-1 rounded-md mb-2"
            style={{ backgroundColor: getTagColor() }}
          >
            <Text className="text-white text-[10px] font-semibold">
              {tag.toUpperCase()}
            </Text>
          </View>

          {/* Title */}
          <Text className="text-white text-sm font-bold" numberOfLines={2}>
            {title}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
}
