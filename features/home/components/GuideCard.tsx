import { View, Image, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { Text } from "@/components/ui/text";
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
      style={[
        styles.container,
        {
          width: CARD_WIDTH,
          backgroundColor: theme.card,
          // Subtle shadow for elevation effect
          shadowColor: isDarkColorScheme ? "#000" : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkColorScheme ? 0.3 : 0.08,
          shadowRadius: 8,
          elevation: 3,
        },
      ]}
    >
      {/* Image */}
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { backgroundColor: theme.muted }]}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        <Text
          className="text-base font-bold leading-5"
          style={{ color: theme.foreground }}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          className="text-sm leading-5 mt-1"
          style={{ color: theme.mutedForeground }}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 120,
  },
  content: {
    padding: 12,
  },
});
